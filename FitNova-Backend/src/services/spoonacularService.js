const axios = require('axios');

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/food/ingredients';

/**
 * Search for food ingredients by query string
 * @param {string} query - The food name to search for
 * @param {number} number - Number of results to return
 * @returns {Promise<Array>} - List of matching ingredients with IDs
 */
async function searchIngredients(query, number = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        apiKey: API_KEY,
        query,
        number,
        metaInformation: true
      }
    });
    return response.data.results;
  } catch (error) {
    console.error(`Error searching ingredients for "${query}":`, error.message);
    return [];
  }
}

/**
 * Get detailed information for a specific ingredient ID, including nutrition
 * @param {number} id - The Spoonacular ingredient ID
 * @param {number} amount - Amount to calculate nutrition for (default 100g)
 * @param {string} unit - Unit for the amount (default 'g')
 * @returns {Promise<Object|null>} - Detailed food object or null if failed
 */
async function getIngredientInformation(id, amount = 100, unit = 'g') {
  try {
    const response = await axios.get(`${BASE_URL}/${id}/information`, {
      params: {
        apiKey: API_KEY,
        amount,
        unit
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error getting info for ingredient ID ${id}:`, error.message);
    return null;
  }
}

/**
 * Helper to map Spoonacular nutrient array to our model's fields
 * @param {Array} nutrients - Array of nutrient objects from API
 * @param {string} name - Nutrient name to find
 * @returns {number} - Amount of the nutrient
 */
function getNutrientAmount(nutrients, name) {
  const nutrient = nutrients.find(n => n.name.toLowerCase() === name.toLowerCase());
  return nutrient ? nutrient.amount : 0;
}

/**
 * Process a raw Spoonacular ingredient object into our Food model format
 * @param {Object} rawData - The raw data from getIngredientInformation
 * @returns {Object} - Formatted object ready for Food model
 */
function mapToFoodModel(rawData) {
  // Spoonacular image base URL needed for full path
  // https://spoonacular.com/food-api/docs#Show-Images
  const IMAGE_BASE_URL = 'https://spoonacular.com/cdn/ingredients_500x500/';

  const nutrients = rawData.nutrition.nutrients;
  
  // Determine category roughly based on verification (this is a simple heuristic)
  // You might want to pass a category in or refine this logic.
  let category = 'protein'; // default fall back
  const protein = getNutrientAmount(nutrients, 'Protein');
  const carbs = getNutrientAmount(nutrients, 'Carbohydrates');
  const fat = getNutrientAmount(nutrients, 'Fat');

  if (carbs > protein && carbs > fat) category = 'carbs';
  if (fat > protein && fat > carbs) category = 'fats';
  // Note: Fruits/Veg/Dairy/etc selection would need more complex logic or manual mapping
  // For now, we put reasonable defaults or need a list map.
  
  // Attempt simple categorization
  const name = rawData.name.toLowerCase();
  if (['apple', 'banana', 'orange', 'grape', 'fruit', 'berry', 'melon', 'mango'].some(f => name.includes(f))) category = 'fruits';
  if (['broccoli', 'carrot', 'spinach', 'kale', 'pepper', 'cucumber', 'vegetable', 'onion', 'garlic'].some(v => name.includes(v))) category = 'vegetables';
  if (['milk', 'yogurt', 'cheese', 'cream', 'dairy', 'butter'].some(d => name.includes(d))) category = 'dairy';
  if (['rice', 'oat', 'bread', 'pasta', 'quinoa', 'grain', 'wheat'].some(g => name.includes(g))) category = 'grains';

  // Heuristic for isVegetarian
  // Spoonacular sometimes has separate fields or we can infer.
  // Ideally, most raw ingredients from 'search' are vegetarian unless meat.
  let isVegetarian = true;
  if (['chicken', 'beef', 'pork', 'lamb', 'turkey', 'fish', 'salmon', 'tuna', 'shrimp', 'meat', 'egg', 'bacon', 'sausage'].some(m => name.includes(m)) && !name.includes('substitute')) { 
      isVegetarian = false;
      category = 'protein';
      // Exception for eggs which are veg in some contexts but often grouped with proteins. 
      // Our model defines 'Eggs' as veg.
      if (name.includes('egg') && !name.includes('white')) isVegetarian = true; 
  }

  return {
    name: rawData.name.charAt(0).toUpperCase() + rawData.name.slice(1), // Capitalize
    category: category,
    isVegetarian: isVegetarian,
    calories: getNutrientAmount(nutrients, 'Calories'),
    protein: protein,
    carbs: carbs,
    fat: fat,
    fiber: getNutrientAmount(nutrients, 'Fiber'),
    servingSize: 100, // We standardized on 100g requests
    servingUnit: 'g',
    verified: true,
    apiSource: 'Spoonacular',
    apiId: rawData.id.toString(),
    image: rawData.image ? `${IMAGE_BASE_URL}${rawData.image}` : null
  };
}

module.exports = {
  searchIngredients,
  getIngredientInformation,
  mapToFoodModel
};
