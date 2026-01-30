const axios = require('axios');

async function debug() {
    try {
        const url = 'https://world.openfoodfacts.org/cgi/search.pl';
        console.log('Fetching...');
        const res = await axios.get(url, {
            params: {
                search_terms: 'Apple',
                search_simple: 1,
                action: 'process',
                json: 1,
                page_size: 5,
                fields: 'code,product_name,nutriments,image_url,image_front_url'
            },
            headers: {
                'User-Agent': 'FitNova-Backend/2.0 (nevilusdad01@gmail.com)'
            }
        });
        
        console.log('Count:', res.data.count);
        if (res.data.products && res.data.products.length > 0) {
            const p = res.data.products[0];
            
            console.log('--- Checks ---');
            console.log('Name:', p.product_name);
            const n = p.nutriments || {};
            const hasCalories = (n['energy-kcal_100g'] !== undefined || n['energy-kcal'] !== undefined);
            const hasProtein = (n['protein_100g'] !== undefined || n['protein'] !== undefined);
            const hasImage = !!(p.image_url || p.image_front_url);
            
            console.log(`Has Name: ${!!p.product_name}`);
            console.log(`Has Calories: ${hasCalories} (energy-kcal: ${n['energy-kcal']}, 100g: ${n['energy-kcal_100g']})`);
            console.log(`Has Protein: ${hasProtein} (protein: ${n['protein']}, 100g: ${n['protein_100g']})`);
            console.log(`Has Image: ${hasImage}`);
            console.log(`WILL PASS: ${!!p.product_name && hasCalories && hasProtein && hasImage}`);
        } else {
            console.log('No products found');
        }

    } catch (e) {
        console.error(e);
    }
}

debug();
