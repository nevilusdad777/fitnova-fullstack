const axios = require('axios');

const BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

/**
 * Search for food products by query string with strict quality filtering
 * @param {string} query - The food name to search for
 * @param {number} pageSize - Number of results to return (we fetch more to filter down)
 * @returns {Promise<Array>} - List of matching products
 */
async function searchFood(query, pageSize = 20) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: pageSize,
        // Request strict fields to ensure data quality
        fields: 'code,product_name,nutriments,image_url,image_front_url,image_small_url,categories_tags,ingredients_analysis_tags,unique_scans_n'
      },
      headers: {
        'User-Agent': 'FitNova-Backend/2.0 (nevilusdad01@gmail.com)'
      },
      timeout: 5000 // 5 seconds timeout
    });

    if (response.data && response.data.products) {
      return response.data.products.filter(p => {
        // STRICT QUALITY CONTROL
        const hasName = !!p.product_name;
        // checking for key nutriments
        const n = p.nutriments || {};
        const hasCalories = (n['energy-kcal_100g'] !== undefined || n['energy-kcal'] !== undefined);
        // We won't strictly enforce protein key presence, assuming 0 if missing is filtered later or acceptable.
        
        // IMPORTANT: Must have a valid image. 
        // We reject items without an image to avoid "duck mountain" or placeholders.
        const hasImage = !!(p.image_url || p.image_front_url);

        return hasName && hasCalories && hasImage;
      });
    }
    return [];
  } catch (error) {
    console.error(`Error searching OpenFoodFacts for "${query}":`, error.message);
    return [];
  }
}

/**
 * Helper to safely get nutrient value per 100g
 */
function getNutrient(nutriments, key) {
  if (!nutriments) return 0;
  // prioritize 100g specific, then standard, then value
  const val = nutriments[`${key}_100g`] || nutriments[key] || nutriments[`${key}_value`];
  return typeof val === 'number' ? val : 0;
}

/**
 * Map OpenFoodFacts product to our Food model
 */
function mapToFoodModel(product) {
  const nutriments = product.nutriments || {};
  const name = product.product_name.trim();
  const lowerName = name.toLowerCase();
  
  // --- Categorization Logic ---
  let category = 'protein'; // Default fallback
  const p = getNutrient(nutriments, 'protein');
  const c = getNutrient(nutriments, 'carbohydrates');
  const f = getNutrient(nutriments, 'fat');

  // Tags analysis
  const tags = (product.categories_tags || []).join(' ').toLowerCase();

  // Order of precedence for categorization:
  // 1. Explicit tags
  if (tags.includes('vegetable') || tags.includes('salad')) category = 'vegetables';
  else if (tags.includes('fruit')) category = 'fruits';
  else if (tags.includes('dairy') || tags.includes('milk') || tags.includes('yogurt') || tags.includes('cheese')) category = 'dairy';
  else if (tags.includes('cereal') || tags.includes('grain') || tags.includes('bread') || tags.includes('pasta') || tags.includes('rice')) category = 'grains';
  else if (tags.includes('beverage') || tags.includes('drink') || tags.includes('water') || tags.includes('juice')) category = 'beverages';
  else if (tags.includes('snack') || tags.includes('chip') || tags.includes('chocolate') || tags.includes('biscuit')) category = 'snacks';
  else if (tags.includes('fat') || tags.includes('oil') || tags.includes('nut') || tags.includes('seed')) category = 'fats';
  
  // 2. Name keywords (strong override)
  if (['chicken', 'beef', 'pork', 'lamb', 'fish', 'tuna', 'salmon', 'egg', 'whey', 'steak'].some(k => lowerName.includes(k))) category = 'protein';
  
  // 3. Macro dominance (fallback)
  if (category === 'protein') { // if still default
     if (c > p && c > f) category = 'carbs'; // Generic carbs if not grain/veg/fruit
     if (f > p && f > c) category = 'fats';
  }

  // --- Vegetarian Logic ---
  let isVegetarian = true;
  const analysisTags = product.ingredients_analysis_tags || [];
  
  if (analysisTags.includes('en:non-vegetarian')) {
      isVegetarian = false;
  } else if (analysisTags.includes('en:vegetarian') || analysisTags.includes('en:vegan')) {
      isVegetarian = true;
  } else {
      // Heuristic fallback
      const nonVegKeywords = ['chicken', 'beef', 'pork', 'meat', 'fish', 'tuna', 'salmon', 'shrimp', 'lamb', 'ham', 'bacon', 'turkey', 'sausage'];
      if (nonVegKeywords.some(w => lowerName.includes(w)) && !lowerName.includes('flavor') && !lowerName.includes('artificial')) {
          isVegetarian = false;
      }
  }

  // --- Image Logic ---
  // Prioritize front_url as it's usually the pack shot or clean food shot
  const image = product.image_front_url || product.image_url;

  return {
    name: name,
    category,
    isVegetarian,
    calories: getNutrient(nutriments, 'energy-kcal'),
    protein: p,
    carbs: c,
    fat: f,
    fiber: getNutrient(nutriments, 'fiber'),
    servingSize: 100,
    servingUnit: 'g',
    verified: true, // We verify it by virtue of the seeding process filters
    apiSource: 'OpenFoodFacts',
    apiId: product.code,
    image: image
  };
}

module.exports = {
  searchFood,
  mapToFoodModel
};
