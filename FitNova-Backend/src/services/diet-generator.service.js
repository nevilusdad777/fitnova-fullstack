const Food = require('../models/Food');

class DietGeneratorService {
  constructor() {
    this.foods = [];
  }

  async initialize() {
    this.foods = await Food.find({ verified: true }).lean();
    if (!this.foods || this.foods.length === 0) {
      throw new Error("Food database is empty. Please run the seeder.");
    }
  }

  /**
   * Main entry point to generate the diet plan
   */
  async generateDietPlan(goal, preference, targetCalories, dietType) {
    if (this.foods.length === 0) {
      await this.initialize();
    }

    const { proteinG, carbsG, fatG } = this.calculateMacroTargets(targetCalories, goal);
    const proteinAllocation = this.allocateProtein(proteinG);
    
    // Create deterministic seed based on inputs
    const seedInput = `${goal}-${preference}-${targetCalories}-${dietType}`;
    let seed = 0;
    for(let i = 0; i < seedInput.length; i++) {
        seed = ((seed << 5) - seed) + seedInput.charCodeAt(i);
        seed |= 0;
    }
    this.randomSeed = Math.abs(seed) + 1; // initial seed

    // Iterative Generation & Balancing Loop
    let plan;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        plan = this.constructMeals(targetCalories, goal, preference, dietType, proteinAllocation);
        
        let planTotals = this.calculatePlanTotals(plan);
        plan = this.balancePlan(plan, targetCalories, proteinG, carbsG, fatG, planTotals, preference);
        planTotals = this.calculatePlanTotals(plan);

        if (this.isValidated(planTotals, targetCalories, proteinG, carbsG, fatG)) {
          break; 
        }
      } catch (err) {
        console.warn(`Attempt ${attempts + 1} failed: ${err.message}`);
      }
      attempts++;
    }

    if (!plan) {
      // If we completely failed to build after 5 attempts, just return the best effort
      this.randomSeed = Math.abs(seed) + 1; // reset seed for fallback build
      plan = this.constructMeals(targetCalories, goal, preference, dietType, proteinAllocation);
    }

    const planTotals = this.calculatePlanTotals(plan);
    const perMealMacros = this.calculatePerMealMacros(plan);

    return {
      dailyTotals: planTotals,
      macroTargets: { proteinG, carbsG, fatG, targetCalories },
      mealBreakdown: plan,
      perMealMacros: perMealMacros,
      foodsWithGrams: this.flattenFoodsList(plan)
    };
  }

  /**
   * STEP 1: Calculate Macro Targets based on goal
   */
  calculateMacroTargets(calories, goal) {
    let proteinPct = 0.25, carbsPct = 0.45, fatPct = 0.30;
    
    if (goal === 'Weight Loss') {
      proteinPct = 0.35; carbsPct = 0.35; fatPct = 0.30;
    } else if (goal === 'Maintain') {
      proteinPct = 0.25; carbsPct = 0.45; fatPct = 0.30;
    } else if (goal === 'Weight Gain') {
      proteinPct = 0.25; carbsPct = 0.50; fatPct = 0.25;
    }

    return {
      proteinG: Math.round((calories * proteinPct) / 4),
      carbsG: Math.round((calories * carbsPct) / 4),
      fatG: Math.round((calories * fatPct) / 9)
    };
  }

  /**
   * STEP 2: Allocate Protein per Meal
   */
  allocateProtein(totalProteinG) {
    return {
      breakfast: Math.round(totalProteinG * 0.25),
      lunch: Math.round(totalProteinG * 0.30),
      snack: Math.round(totalProteinG * 0.20),
      dinner: Math.round(totalProteinG * 0.25)
    };
  }

  calculatePlanTotals(plan) {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const meal of Object.values(plan)) {
      for (const food of meal.foods) {
        totals.calories += food.calories;
        totals.protein += food.protein;
        totals.carbs += food.carbs;
        totals.fat += food.fat;
      }
    }
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat)
    };
  }

  calculatePerMealMacros(plan) {
    const perMeal = {};
    for (const [mealName, mealData] of Object.entries(plan)) {
      perMeal[mealName] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      for (const food of mealData.foods) {
        perMeal[mealName].calories += food.calories;
        perMeal[mealName].protein += food.protein;
        perMeal[mealName].carbs += food.carbs;
        perMeal[mealName].fat += food.fat;
      }
      Object.keys(perMeal[mealName]).forEach(k => {
        perMeal[mealName][k] = Math.round(perMeal[mealName][k]);
      });
    }
    return perMeal;
  }

  flattenFoodsList(plan) {
    const flat = [];
    for (const [mealName, mealData] of Object.entries(plan)) {
      for (const food of mealData.foods) {
        flat.push({
          meal: mealName,
          name: food.name,
          serving_g: food.serving_g,
          calories: Math.round(food.calories),
          protein: Math.round(food.protein),
          carbs: Math.round(food.carbs),
          fat: Math.round(food.fat)
        });
      }
    }
    return flat;
  }

  isValidated(totals, targetCal, targetP, targetC, targetF) {
    return (
      Math.abs(totals.protein - targetP) <= 5 &&
      Math.abs(totals.carbs - targetC) <= 8 &&
      Math.abs(totals.fat - targetF) <= 5
    );
  }

  /**
   * Deterministic simple PRNG (LCG)
   */
  nextRandom() {
    this.randomSeed = (this.randomSeed * 16807) % 2147483647;
    return (this.randomSeed - 1) / 2147483646;
  }

  /**
   * Helper to pick a random food matching criteria
   */
  pickFood(pool) {
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(this.nextRandom() * pool.length)];
  }

  /**
   * Apply hard limits on quantities
   */
  clampQuantity(food, grams) {
    const limits = {
      'Seeds': 20,
      'Oil': 10,
      'Ghee': 10,
      'Paneer': 200,
      'Soya': 60,
      'Rice': 150,
      'Trail Mix': 30
    };
    
    let maxAllowed = food.max_serving_g || 300;
    
    for (const [key, limit] of Object.entries(limits)) {
      if (food.name.toLowerCase().includes(key.toLowerCase())) {
        maxAllowed = Math.min(maxAllowed, limit);
      }
    }
    if (food.food_group === 'nuts') maxAllowed = Math.min(maxAllowed, 40);
    if (food.food_group === 'seeds') maxAllowed = Math.min(maxAllowed, 20);
    const ln = food.name.toLowerCase();
    if (food.food_group === 'oil' || (ln.includes('butter') && !ln.includes('peanut') && !ln.includes('masala') && !ln.includes('milk'))) maxAllowed = Math.min(maxAllowed, 15);
    if (ln.includes('cheese') && !ln.includes('cottage')) maxAllowed = Math.min(maxAllowed, 40);
    
    let minAllowed = food.min_serving_g || 10;
    if (ln.includes('masala') && !ln.includes('garam') && !ln.includes('chana masala')) minAllowed = Math.max(minAllowed, 50);
    
    let clamped = Math.min(Math.max(grams, minAllowed), maxAllowed);
    return Math.round(clamped);
  }

  buildFoodEntry(food, grams) {
    if (!food) return null;
    const factor = grams / 100;
    return {
      _id: food._id,
      name: food.name,
      serving_g: grams,
      calories: food.calories * factor,
      protein: food.protein * factor,
      carbs: food.carbs * factor,
      fat: food.fat * factor,
      food_group: food.food_group,
      is_primary_protein: food.is_primary_protein
    };
  }

  getFoodsByCriteria(criteria) {
    return this.foods.filter(f => {
      for (const [key, val] of Object.entries(criteria)) {
        if (key === 'name_includes') {
           if (!f.name.toLowerCase().includes(val.toLowerCase())) return false;
        } else if (key === 'meal_allowed') {
           if (!f.meal_allowed || !f.meal_allowed.includes(val)) return false;
        } else if (f[key] !== val) {
           return false;
        }
      }
      return true;
    });
  }

  constructMeals(targetCalories, goal, preference, dietType, pAlloc) {
    let plan = {
      breakfast: { foods: [] },
      lunch: { foods: [] },
      snack: { foods: [] },
      dinner: { foods: [] }
    };

    let availableFoods = this.foods;
    if (preference === 'Vegetarian' || preference === 'Veg') {
      availableFoods = availableFoods.filter(f => f.isVegetarian);
    }

    const nMatches = (food, arr) => arr.some(k => food.name.toLowerCase().includes(k));
    const isEx = (food, arr) => arr.some(k => food.name.toLowerCase().includes(k));

    // Breakfast: 1 base carb, 1 protein, 1 fruit, 1 seeds (optional based on calories but preferred)
    let bfCarbList = ['oats', 'upma', 'poha', 'dosa', 'idli', 'bread', 'paratha', 'muesli'];
    let bfProtList = ['paneer', 'tofu', 'curd', 'yogurt', 'soy', 'cheese', 'egg'];
    let exGrains = ['paratha', 'roti', 'dosa', 'rice', 'idli', 'chapati', 'naan', 'bhakri', 'chilla', 'cheela'];
    let exCurries = ['masala', 'kadai', 'chilli', 'butter', 'makhani', 'bhurji', 'curry', 'gravy'];
    
    let bfCarbs = availableFoods.filter(f => f.food_group === 'grain' && nMatches(f, bfCarbList));
    if(bfCarbs.length === 0) bfCarbs = availableFoods.filter(f => f.food_group === 'grain' && f.meal_allowed && f.meal_allowed.includes('breakfast'));
    
    let bfProteins = availableFoods.filter(f => (f.is_primary_protein || f.food_group === 'dairy') && nMatches(f, bfProtList) && !isEx(f, exGrains) && !isEx(f, exCurries));
    if(bfProteins.length === 0) bfProteins = availableFoods.filter(f => f.is_primary_protein && f.meal_allowed && f.meal_allowed.includes('breakfast') && !isEx(f, exGrains) && !isEx(f, exCurries));
    
    let bfFruits = availableFoods.filter(f => f.food_group === 'fruit');
    let bfSeeds = availableFoods.filter(f => f.food_group === 'seeds');
    
    let bCarb = this.pickFood(bfCarbs);
    let bProt = this.pickFood(bfProteins);
    let bFruit = this.pickFood(bfFruits);
    let bSeed = this.pickFood(bfSeeds);

    if (bProt) {
      let reqGrams = (pAlloc.breakfast / Math.max(bProt.protein, 1)) * 100;
      if (bProt.name.toLowerCase().includes('yogurt') || bProt.name.toLowerCase().includes('curd')) reqGrams = Math.max(reqGrams, 150);
      reqGrams = this.clampQuantity(bProt, reqGrams);
      plan.breakfast.foods.push(this.buildFoodEntry(bProt, reqGrams));
      pAlloc.breakfast -= (bProt.protein * reqGrams / 100);
    }
    if (bCarb) {
      plan.breakfast.foods.push(this.buildFoodEntry(bCarb, this.clampQuantity(bCarb, 50)));
    }
    if (bFruit) {
      plan.breakfast.foods.push(this.buildFoodEntry(bFruit, this.clampQuantity(bFruit, 100)));
    }
    if (bSeed) {
      plan.breakfast.foods.push(this.buildFoodEntry(bSeed, this.clampQuantity(bSeed, 10)));
    }


    // Lunch & Dinner: 1 grain (roti/rice), 1 dal/legume, 1 vegetable, 1 protein boost (paneer/tofu/soy)
    let grainList = ['roti', 'rice', 'chapati', 'naan', 'phulka', 'paratha', 'bhakri', 'quinoa', 'daliya'];
    let boostList = ['paneer', 'tofu', 'soy', 'soya'];
    let curdList = ['curd', 'yogurt', 'raita'];

    const isDal = (f) => {
       let n = f.name.toLowerCase();
       return (n.includes('dal') || n.includes('chana') || n.includes('rajma') || f.food_group === 'legume') && !n.includes('daliya') && !n.includes('badam');
    };

    ['lunch', 'dinner'].forEach(meal => {
      let grains = availableFoods.filter(f => f.food_group === 'grain' && nMatches(f, grainList));
      if(grains.length === 0) grains = availableFoods.filter(f => f.food_group === 'grain' && f.meal_allowed && f.meal_allowed.includes(meal));
      
      let legumes = availableFoods.filter(f => isDal(f) && (!nMatches(f, boostList) || f.name.toLowerCase().includes('dal')) && f.meal_allowed && f.meal_allowed.includes(meal));
      if(legumes.length === 0) legumes = availableFoods.filter(f => f.food_group === 'legume');

      let veg = availableFoods.filter(f => f.food_group === 'vegetable' && f.meal_allowed && f.meal_allowed.includes(meal));
      
      let pBoost = availableFoods.filter(f => f.is_primary_protein && nMatches(f, boostList) && !isEx(f, exGrains));
      if(pBoost.length === 0) pBoost = availableFoods.filter(f => f.is_primary_protein && f.meal_allowed && f.meal_allowed.includes(meal) && !isEx(f, exGrains));

      let mGrain = this.pickFood(grains);
      let mLegume = this.pickFood(legumes);
      let mVeg = this.pickFood(veg);
      let mBoost = this.pickFood(pBoost);

      let pTarget = pAlloc[meal];
      let cuts = meal === 'dinner' ? 3 : 2; // For dinner, spread protein to curd too
      
      if (mLegume) {
        let reqGrams = ((pTarget / cuts) / Math.max(mLegume.protein, 1)) * 100;
        reqGrams = this.clampQuantity(mLegume, reqGrams);
        plan[meal].foods.push(this.buildFoodEntry(mLegume, reqGrams));
      }
      if (mBoost) {
        let reqGrams = ((pTarget / cuts) / Math.max(mBoost.protein, 1)) * 100;
        reqGrams = this.clampQuantity(mBoost, reqGrams);
        plan[meal].foods.push(this.buildFoodEntry(mBoost, reqGrams));
      }
      if (mGrain) {
        let defaultGram = mGrain.name.toLowerCase().includes('roti') || mGrain.name.toLowerCase().includes('chapati') ? 60 : 100;
        plan[meal].foods.push(this.buildFoodEntry(mGrain, this.clampQuantity(mGrain, defaultGram)));
      }
      if (mVeg) {
        plan[meal].foods.push(this.buildFoodEntry(mVeg, this.clampQuantity(mVeg, 150)));
      }
      // Add Curd to Dinner
      if (meal === 'dinner') {
         let curds = availableFoods.filter(f => f.food_group === 'dairy' && nMatches(f, curdList) && !f.name.toLowerCase().includes('rice'));
         let mCurd = this.pickFood(curds);
         if (mCurd) {
            plan[meal].foods.push(this.buildFoodEntry(mCurd, this.clampQuantity(mCurd, 100)));
         }
      }
    });

    // Snack Combinations (Strict Rules)
    const combos = [
      ['yogurt', 'seeds'],
      ['fruit', 'peanut butter'],
      ['roasted chana', 'sprouts chaat'],  // multi-item array
      ['paneer cubes']    // using 'paneer'
    ];
    let comboStrs = this.pickFood(combos);
    
    comboStrs.forEach(matchStr => {
       // Identify food group intent
       let pool = availableFoods;
       if (matchStr === 'yogurt') pool = pool.filter(f => f.food_group === 'dairy' && (f.name.toLowerCase().includes('yogurt') || f.name.toLowerCase().includes('curd')) && !f.name.toLowerCase().includes('rice'));
       else if (matchStr === 'seeds') pool = pool.filter(f => f.food_group === 'seeds');
       else if (matchStr === 'fruit') pool = pool.filter(f => f.food_group === 'fruit');
       else if (matchStr === 'peanut butter') pool = pool.filter(f => f.name.toLowerCase().includes('peanut butter') || (f.food_group === 'nuts' && f.name.toLowerCase().includes('peanut')));
       else if (matchStr === 'roasted chana') pool = pool.filter(f => (f.name.toLowerCase().includes('roasted chana') || f.name.toLowerCase().includes('chana') || f.name.toLowerCase().includes('chickpea')) && !f.name.toLowerCase().includes('masala') && !f.name.toLowerCase().includes('curry'));
       else if (matchStr === 'sprouts chaat') pool = pool.filter(f => f.name.toLowerCase().includes('sprout'));
       else if (matchStr === 'paneer cubes') pool = pool.filter(f => f.name.toLowerCase().includes('paneer') && !isEx(f, exCurries) && !isEx(f, exGrains) && !f.name.toLowerCase().includes('palak') && !f.name.toLowerCase().includes('matar') && !f.name.toLowerCase().includes('tikka'));
       
       if (pool.length === 0 && matchStr === 'peanut butter') pool = availableFoods.filter(f => f.food_group === 'nuts'); // fallback to nuts
       if (pool.length === 0 && matchStr === 'seeds') pool = availableFoods.filter(f => f.food_group === 'seeds' || f.food_group === 'nuts');

       let item = this.pickFood(pool);
       if (item) {
          let targetP = pAlloc.snack / comboStrs.length;
          let reqGrams = (targetP / Math.max(item.protein, 1)) * 100;
          if (matchStr === 'fruit') {
             reqGrams = 150;
             if(item.name.toLowerCase().includes('raisin') || item.name.toLowerCase().includes('date') || item.name.toLowerCase().includes('fig')) reqGrams = 30;
          }
          if (matchStr === 'seeds' || matchStr === 'peanut butter' || item.food_group === 'nuts') reqGrams = 20;
          if (matchStr === 'paneer cubes' || matchStr === 'sprouts chaat') reqGrams = 100;
          if (matchStr === 'roasted chana') reqGrams = 50;
          if (matchStr === 'yogurt' || reqGrams > 250) reqGrams = 150;
          
          reqGrams = this.clampQuantity(item, reqGrams);
          plan.snack.foods.push(this.buildFoodEntry(item, reqGrams));
       }
    });

    return plan;
  }

  /**
   * STEP 6 & 7: Balance Carbs and Fats loop
   */
  balancePlan(plan, targetCalories, proteinG, carbsG, fatG, planTotals, preference) {
    let pDiff = proteinG - planTotals.protein;
    let cDiff = carbsG - planTotals.carbs;
    let fDiff = fatG - planTotals.fat;

    let iterations = 0;
    while(iterations < 50) {
      if (Math.abs(pDiff) <= 8 && Math.abs(cDiff) <= 12 && Math.abs(fDiff) <= 8) {
        break; 
      }

      // Adjust Protein
      if (pDiff > 5) {
         for (let meal of Object.values(plan)) {
            let pts = meal.foods.filter(f => f.is_primary_protein || f.food_group === 'legume');
            if (pts.length > 0) {
               let p = this.pickFood(pts);
               p.serving_g += 15;
               // recalculate
               let oriFood = this.foods.find(f => f._id.toString() === p._id.toString());
               if(oriFood){
                 p.serving_g = this.clampQuantity(oriFood, p.serving_g);
                 let factor = p.serving_g / 100;
                 p.protein = oriFood.protein * factor; p.carbs = oriFood.carbs * factor; p.fat = oriFood.fat * factor; p.calories = oriFood.calories * factor;
               }
            }
         }
      } else if (pDiff < -5) {
         for (let meal of Object.values(plan)) {
            let pts = meal.foods.filter(f => f.is_primary_protein && f.serving_g > 20);
            if (pts.length > 0) {
               let p = this.pickFood(pts);
               p.serving_g -= 10;
               let oriFood = this.foods.find(f => f._id.toString() === p._id.toString());
               if(oriFood){
                 let factor = p.serving_g / 100;
                 p.protein = oriFood.protein * factor; p.carbs = oriFood.carbs * factor; p.fat = oriFood.fat * factor; p.calories = oriFood.calories * factor;
               }
            }
         }
      }

      // Adjust Carbs (Grains)
      if (cDiff > 10) {
         for (let meal of Object.values(plan)) {
            let grs = meal.foods.filter(f => f.food_group === 'grain' || f.food_group === 'fruit');
            if (grs.length > 0) {
               let g = this.pickFood(grs);
               g.serving_g += 15;
               let oriFood = this.foods.find(f => f._id.toString() === g._id.toString());
               if(oriFood){
                 g.serving_g = this.clampQuantity(oriFood, g.serving_g);
                 let factor = g.serving_g / 100;
                 g.protein = oriFood.protein * factor; g.carbs = oriFood.carbs * factor; g.fat = oriFood.fat * factor; g.calories = oriFood.calories * factor;
               }
            }
         }
      } else if (cDiff < -8) {
         for (let meal of Object.values(plan)) {
            let grs = meal.foods.filter(f => f.food_group === 'grain' && f.serving_g > 30);
            if (grs.length > 0) {
               let g = this.pickFood(grs);
               g.serving_g -= 10;
               let oriFood = this.foods.find(f => f._id.toString() === g._id.toString());
               if(oriFood){
                 let factor = g.serving_g / 100;
                 g.protein = oriFood.protein * factor; g.carbs = oriFood.carbs * factor; g.fat = oriFood.fat * factor; g.calories = oriFood.calories * factor;
               }
            }
         }
      }

      // Adjust Fats (Oils, Nuts)
      if (fDiff > 8) {
          for (let meal of Object.values(plan)) {
            let fats = meal.foods.filter(f => f.food_group === 'nuts' || f.food_group === 'seeds' || f.name.toLowerCase().includes('oil') || f.name.toLowerCase().includes('butter') || f.food_group === 'dairy');
            if (fats.length > 0) {
               let fa = this.pickFood(fats);
               fa.serving_g += 10;
               let oriFood = this.foods.find(f => f._id.toString() === fa._id.toString());
               if(oriFood){
                 fa.serving_g = this.clampQuantity(oriFood, fa.serving_g);
                 let factor = fa.serving_g / 100;
                 fa.protein = oriFood.protein * factor; fa.carbs = oriFood.carbs * factor; fa.fat = oriFood.fat * factor; fa.calories = oriFood.calories * factor;
               }
            }
          }
      } else if (fDiff < -8) {
          for (let meal of Object.values(plan)) {
            let fats = meal.foods.filter(f => (f.food_group === 'nuts' || f.food_group === 'seeds' || f.name.toLowerCase().includes('oil') || f.name.toLowerCase().includes('butter') || f.food_group === 'dairy') && f.serving_g > 10);
            if (fats.length > 0) {
               let fa = this.pickFood(fats);
               fa.serving_g -= 10;
               let oriFood = this.foods.find(f => f._id.toString() === fa._id.toString());
               if(oriFood){
                 let factor = fa.serving_g / 100;
                 fa.protein = oriFood.protein * factor; fa.carbs = oriFood.carbs * factor; fa.fat = oriFood.fat * factor; fa.calories = oriFood.calories * factor;
               }
            }
          }
      }

      // Check overarching calories diff to cut from all macros proportionally
      const calDiff = planTotals.calories - targetCalories;
      if (Math.abs(calDiff) > 150) {
         const factor = calDiff > 0 ? 0.9 : 1.1; // scale back 10% or scale up 10%
         for (let meal of Object.values(plan)) {
            for (let f of meal.foods) {
               // Dont modify vegetables much or limit minimum 
               if(f.food_group === 'vegetable' && factor < 1) continue;
               
               let oriFood = this.foods.find(ori => ori._id.toString() === f._id.toString());
               if(oriFood){
                 f.serving_g = f.serving_g * factor;
                 f.serving_g = this.clampQuantity(oriFood, f.serving_g);
                 let mult = f.serving_g / 100;
                 f.protein = oriFood.protein * mult; f.carbs = oriFood.carbs * mult; f.fat = oriFood.fat * mult; f.calories = oriFood.calories * mult;
               }
            }
         }
      }

      // Recalculate diffs
      planTotals = this.calculatePlanTotals(plan);
      pDiff = proteinG - planTotals.protein;
      cDiff = carbsG - planTotals.carbs;
      fDiff = fatG - planTotals.fat;
      
      iterations++;
    }

    return plan;
  }
}

module.exports = new DietGeneratorService();
