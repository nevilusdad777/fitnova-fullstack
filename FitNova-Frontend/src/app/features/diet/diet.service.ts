import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FoodItem {
  foodId?: string;
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  quantity: number;
  unit: string;
  servingSize?: number;
}

export interface Food {
  _id: string;
  name: string;
  category: string;
  description?: string;
  isVegetarian: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
  servingUnit: string;
  image?: string;
}

export interface Meal {
  _id: string;
  user: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  completed?: boolean;
  completedAt?: Date | null;
  completedFoodIndices?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietPlanFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  isVegetarian?: boolean;
}

export interface DietPlanMeal {
  mealType: string;
  calories: number;
  foods: DietPlanFood[];
}

export interface DietPlan {
  meals: DietPlanMeal[];
  totalCalories: number;
  coachTip: string;
}

export interface MacroTargets {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

@Injectable({
  providedIn: 'root'
})
export class DietService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/diet`;

  // State
  meals = signal<Meal[]>([]);
  foods = signal<Food[]>([]);
  customFoods = signal<Food[]>([]);

  // Get today's meals
  getTodayMeals(): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${this.apiUrl}/today`).pipe(
      tap(meals => this.meals.set(meals))
    );
  }

  // Get user's custom foods only
  getMyCustomFoods(): Observable<Food[]> {
    return this.http.get<{ data: Food[] }>(`${environment.apiUrl}/food?apiSource=user`).pipe(
      map(response => response.data),
      tap(foods => this.customFoods.set(foods))
    );
  }

  // Create a custom food item
  createCustomFood(foodData: Partial<Food>): Observable<Food> {
    return this.http.post<{ success: boolean; data: Food }>(`${environment.apiUrl}/food`, foodData).pipe(
      map(response => response.data),
      tap(newFood => {
        this.foods.update(current => [...current, newFood]);
        this.customFoods.update(current => [...current, newFood]);
      })
    );
  }

  // Update a custom food item
  updateCustomFood(id: string, foodData: Partial<Food>): Observable<Food> {
    return this.http.put<{ success: boolean; data: Food }>(`${environment.apiUrl}/food/${id}`, foodData).pipe(
      map(response => response.data),
      tap(updated => {
        this.customFoods.update(current => current.map(f => f._id === id ? updated : f));
        this.foods.update(current => current.map(f => f._id === id ? updated : f));
      })
    );
  }

  // Delete a custom food item
  deleteCustomFood(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/food/${id}`).pipe(
      tap(() => {
        this.customFoods.update(current => current.filter(f => f._id !== id));
        this.foods.update(current => current.filter(f => f._id !== id));
      })
    );
  }

  // Get food database
  getFoodDatabase(): Observable<Food[]> {
    return this.http.get<Food[] | { data: Food[] }>(`${environment.apiUrl}/food`).pipe(
      map((response: Food[] | { data: Food[] }) => {
        return Array.isArray(response) ? response : response.data;
      }),
      tap(foods => this.foods.set(foods))
    );
  }

  // Add meal
  addMeal(mealData: { mealType: string; foods: any[] }): Observable<Meal> {
    return this.http.post<Meal>(`${this.apiUrl}/log`, mealData).pipe(
      tap(newMeal => {
        this.meals.update(current => [...current, newMeal]);
      })
    );
  }

  // Delete meal
  deleteMeal(mealId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${mealId}`).pipe(
      tap(() => {
        this.meals.update(current => current.filter(m => m._id !== mealId));
      })
    );
  }

  // Toggle meal completion
  toggleMealCompletion(mealId: string): Observable<Meal> {
    return this.http.patch<Meal>(`${this.apiUrl}/${mealId}/complete`, {}).pipe(
      tap(updatedMeal => {
        this.meals.update(current =>
          current.map(m => m._id === mealId ? updatedMeal : m)
        );
      })
    );
  }

  // Toggle individual food item completion
  toggleFoodItemCompletion(mealId: string, foodIndex: number): Observable<Meal> {
    return this.http.patch<Meal>(`${this.apiUrl}/${mealId}/food-complete`, { foodIndex }).pipe(
      tap((updatedMeal) => {
        this.meals.update(current => current.map(m =>
          m._id === mealId ? updatedMeal : m
        ));
      })
    );
  }

  // Get nutrition summary (based on completed food items)
  getNutritionSummary(): NutritionSummary {
    const allMeals = this.meals();
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    allMeals.forEach(meal => {
      if (meal.completedFoodIndices && meal.completedFoodIndices.length > 0) {
        meal.foods.forEach((food, index) => {
          if (meal.completedFoodIndices!.includes(index)) {
            totalCalories += food.calories * food.quantity;
            totalProtein += food.protein * food.quantity;
            totalCarbs += food.carbs * food.quantity;
            totalFat += food.fat * food.quantity;
          }
        });
      } else if (meal.completed) {
        totalCalories += meal.totalCalories;
        totalProtein += meal.totalProtein;
        totalCarbs += meal.totalCarbs;
        totalFat += meal.totalFat;
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 100) / 100,
      carbs: Math.round(totalCarbs * 100) / 100,
      fat: Math.round(totalFat * 100) / 100
    };
  }

  // Delete individual food item from meal
  deleteFoodFromMeal(mealId: string, foodIndex: number): Observable<any> {
    const meal = this.meals().find(m => m._id === mealId);
    if (!meal) {
      return new Observable(observer => {
        observer.error({ message: 'Meal not found' });
        observer.complete();
      });
    }

    const updatedFoods = meal.foods.filter((_, index) => index !== foodIndex);

    let updatedCompletedIndices: number[] = [];
    if (meal.completedFoodIndices && meal.completedFoodIndices.length > 0) {
      updatedCompletedIndices = meal.completedFoodIndices
        .filter(index => index !== foodIndex)
        .map(index => index > foodIndex ? index - 1 : index);
    }

    return this.http.put<Meal>(`${this.apiUrl}/${mealId}`, {
      mealType: meal.mealType,
      foods: updatedFoods,
      completedFoodIndices: updatedCompletedIndices
    }).pipe(
      tap((updatedMeal) => {
        this.meals.update(current => current.map(m =>
          m._id === mealId ? updatedMeal : m
        ));
      })
    );
  }

  // Update a meal (full update)
  updateMeal(mealId: string, mealData: any): Observable<Meal> {
    return this.http.put<Meal>(`${this.apiUrl}/${mealId}`, mealData).pipe(
      tap((updatedMeal) => {
        this.meals.update(current => current.map(m =>
          m._id === mealId ? updatedMeal : m
        ));
      })
    );
  }

  // =====================================================================
  // MACRO TARGET MATRIX — goal × dietType → protein/carb/fat %
  // =====================================================================

  getMacroTargets(goal: string, dietType: string): MacroTargets {
    const matrix: Record<string, Record<string, { proteinPct: number; carbsPct: number; fatPct: number }>> = {
      // Weight Loss — classic 40C/30P/30F; Fitness bumps protein to 35%
      'Weight Loss': {
        'Traditional': { proteinPct: 0.30, carbsPct: 0.40, fatPct: 0.30 },  // 40/30/30
        'Fitness':     { proteinPct: 0.35, carbsPct: 0.35, fatPct: 0.30 },  // 35/35/30 — higher protein cut
        'Balanced':    { proteinPct: 0.30, carbsPct: 0.40, fatPct: 0.30 },  // 40/30/30
      },
      // Weight Gain — Fitness uses 45/35/20 (high-protein lean bulk); Traditional uses 40/30/30
      'Weight Gain': {
        'Traditional': { proteinPct: 0.30, carbsPct: 0.40, fatPct: 0.30 },  // 40/30/30
        'Fitness':     { proteinPct: 0.35, carbsPct: 0.45, fatPct: 0.20 },  // 45/35/20 lean bulk
        'Balanced':    { proteinPct: 0.30, carbsPct: 0.45, fatPct: 0.25 },  // 45/30/25
      },
      // Maintain — universal 40/30/30 standard
      'Maintain': {
        'Traditional': { proteinPct: 0.30, carbsPct: 0.40, fatPct: 0.30 },  // 40/30/30
        'Fitness':     { proteinPct: 0.30, carbsPct: 0.40, fatPct: 0.30 },  // 40/30/30
        'Balanced':    { proteinPct: 0.30, carbsPct: 0.40, fatPct: 0.30 },  // 40/30/30
      }
    };

    const pct = matrix[goal]?.[dietType] ?? { proteinPct: 0.25, carbsPct: 0.50, fatPct: 0.25 };
    return {
      ...pct,
      proteinG: 0, // will be computed with calories
      carbsG: 0,
      fatG: 0,
    };
  }

  /** Given calories + macro pcts, return gram amounts */
  computeMacroGrams(targetCalories: number, macros: MacroTargets): MacroTargets {
    return {
      ...macros,
      proteinG: Math.round((targetCalories * macros.proteinPct) / 4),
      carbsG:   Math.round((targetCalories * macros.carbsPct) / 4),
      fatG:     Math.round((targetCalories * macros.fatPct) / 9),
    };
  }

  // =====================================================================
  // MAIN PLAN GENERATOR
  // =====================================================================

  generateDietPlan(goal: string, preference: string, targetCalories: number, dietType: string = 'Traditional'): DietPlan {
    const macros = this.computeMacroGrams(targetCalories, this.getMacroTargets(goal, dietType));

    // Meal calorie distribution: breakfast 30%, lunch 35%, snack 10%, dinner 25%
    const mealTargets = {
      breakfast: Math.round(targetCalories * 0.30),
      lunch:     Math.round(targetCalories * 0.35),
      snack:     Math.round(targetCalories * 0.10),
      dinner:    Math.round(targetCalories * 0.25),
    };

    const meals: DietPlanMeal[] = [
      this.generateSmartMeal('Breakfast', mealTargets.breakfast, preference, dietType, macros),
      this.generateSmartMeal('Lunch',     mealTargets.lunch,     preference, dietType, macros),
      this.generateSmartMeal('Snacks',    mealTargets.snack,     preference, dietType, macros),
      this.generateSmartMeal('Dinner',    mealTargets.dinner,    preference, dietType, macros),
    ];

    let totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

    // --- RE-BALANCING PASS ---
    // If we overshoot by more than 5%, or undershoot by more than 5%, try to adjust the snack
    const diff = totalCalories - targetCalories;
    if (Math.abs(diff) > targetCalories * 0.05) {
      const snackIdx = meals.findIndex(m => m.mealType === 'Snacks');
      if (snackIdx !== -1) {
        const newSnackTarget = Math.max(50, mealTargets.snack - diff);
        const newSnack = this.generateSmartMeal('Snacks', newSnackTarget, preference, dietType, macros);
        meals[snackIdx] = newSnack;
        totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
      }
    }

    const coachTip = this.getCoachTip(goal, dietType, preference, macros, targetCalories);

    return { meals, totalCalories, coachTip };
  }

  // =====================================================================
  // SAVE DIET PLAN TO JOURNAL
  // =====================================================================

  saveDietPlan(plan: DietPlan): Observable<any> {
    const foodsArray = this.foods();
    const requests = plan.meals.map(meal => {
      const foods = meal.foods.map(food => {
        const dbFood = foodsArray.find(f => f.name === food.name);

        const servingParts = food.serving.split(' ');
        const quantity = parseFloat(servingParts[0]) || 1;
        const unit = servingParts.slice(1).join(' ') || 'serving';

        const foodItem = {
          id: dbFood?._id || '',
          name: food.name || 'Unknown Food',
          calories: Math.round(Number(food.calories) || 0),
          protein: Math.round((Number(food.protein) || 0) * 10) / 10,
          carbs: Math.round((Number(food.carbs) || 0) * 10) / 10,
          fat: Math.round((Number(food.fat) || 0) * 10) / 10,
          quantity: 1,
          unit: unit || 'g',
          servingSize: quantity || dbFood?.servingSize || 100
        };

        return foodItem;
      });

      return this.addMeal({
        mealType: meal.mealType.toLowerCase() === 'snacks' ? 'snack' : meal.mealType.toLowerCase(),
        foods
      });
    });

    if (requests.length === 0) {
      return new Observable(observer => {
        observer.error('No meals to save');
        observer.complete();
      });
    }

    return forkJoin(requests).pipe(
      tap(() => this.getTodayMeals().subscribe())
    );
  }

  // =====================================================================
  // MEAL-TIME APPROPRIATENESS FILTERS
  // =====================================================================

  private isBreakfastAppropriate(food: Food, preference: string): boolean {
    const name = food.name.toLowerCase();

    // Non-veg: eggs are fine for breakfast; other meats are not
    if (!food.isVegetarian) {
      return name.includes('egg') || name.includes('omelette') || name.includes('bhurji');
    }

    // Positive matches for veg breakfast
    const breakfastOk = [
      'idli', 'dosa', 'upma', 'poha', 'oats', 'cornflakes', 'muesli',
      'uttapam', 'appam', 'roti (plain)', 'roti (whole wheat)', 'multigrain roti',
      'bajra roti', 'jowar roti', 'tandoori roti', 'khichdi', 'paratha'
    ];
    if (breakfastOk.some(k => name.includes(k))) return true;

    // Negative matches (lunch/dinner only grains)
    const notBreakfast = [
      'naan', 'biryani', 'pulao', 'jeera rice', 'fried rice',
      'kulcha', 'bhatura', 'laccha', 'plain rice', 'basmati rice', 'brown rice'
    ];
    if (notBreakfast.some(k => name.includes(k))) return false;

    // Conservative default for unmatched grains
    if (food.category === 'grains') return false;

    return true;
  }

  private isDinnerAppropriate(food: Food): boolean {
    const name = food.name.toLowerCase();
    const notDinner = ['kellogg', 'cornflakes', 'chocos', 'muesli', 'poha', 'upma'];
    return !notDinner.some(k => name.includes(k));
  }

  private isSnackAppropriate(food: Food): boolean {
    return ['snacks', 'fruits', 'fats', 'beverages'].includes(food.category);
  }

  private isFitnessAppropriate(food: Food): boolean {
    const name = food.name.toLowerCase();

    const banned = [
      'naan', 'bhatura', 'puri (deep fried)', 'jalebi', 'gulab jamun', 'rasgulla',
      'ladoo', 'barfi', 'halwa', 'kachori', 'samosa', 'pakora',
      'biryani', 'fried rice', 'paratha (aloo)', 'paratha (paneer)', 'paratha (gobi)',
      'laccha paratha', 'chips', 'kurkure', 'biscuit', 'good day', 'marie',
      'dark fantasy', 'parle', 'chocos', 'kellogg', 'coca cola', 'pepsi', 'thums up',
      'lassi (sweet)', 'sugarcane', 'vada pav', 'pav bhaji', 'haldiram'
    ];
    if (banned.some(k => name.includes(k))) return false;

    if (food.category === 'grains') {
      const fitGrains = ['oats', 'brown rice', 'roti (whole wheat)', 'multigrain', 'idli', 'khichdi', 'upma'];
      return fitGrains.some(k => name.includes(k));
    }

    if (['protein', 'vegetables', 'fruits'].includes(food.category)) return true;

    if (food.category === 'dairy') {
      return !name.includes('sweet') && !name.includes('sugar');
    }

    if (food.category === 'fats') {
      const fitFats = ['almond', 'walnut', 'cashew', 'peanut', 'chia', 'flax', 'pumpkin seed', 'olive oil'];
      return fitFats.some(k => name.includes(k));
    }

    if (food.category === 'beverages') {
      const fitBevs = ['green tea', 'black', 'chaas', 'coconut water', 'nimbu pani'];
      return fitBevs.some(k => name.includes(k));
    }

    if (food.category === 'snacks') {
      const fitSnacks = ['dhokla', 'khaman', 'khandvi'];
      return fitSnacks.some(k => name.includes(k));
    }

    return true;
  }

  // =====================================================================
  // CUISINE ARCHETYPE ENGINE
  // Tags food names to detect their culinary style
  // =====================================================================

  /** Detect cuisine type of a food from its name */
  private getCuisineTag(food: Food): string {
    const n = food.name.toLowerCase();
    if (['idli', 'dosa', 'uttapam', 'appam', 'upma', 'pongal', 'sambhar',
         'coconut chutney', 'vada', 'rasam', 'avial', 'kootu'].some(k => n.includes(k))) {
      return 'SOUTH_INDIAN';
    }
    if (['roti', 'paratha', 'naan', 'kulcha', 'chapati', 'tandoori roti',
         'bhatura', 'puri', 'bajra roti', 'jowar roti', 'multigrain roti'].some(k => n.includes(k))) {
      return 'NORTH_ROTI';
    }
    if (['biryani', 'pulao', 'jeera rice', 'brown rice', 'plain rice',
         'basmati rice', 'fried rice', 'khichdi'].some(k => n.includes(k))) {
      return 'NORTH_RICE';
    }
    if (['oats', 'cornflakes', 'muesli', 'bread', 'toast', 'poha',
         'egg', 'omelette', 'bhurji', 'sandwich'].some(k => n.includes(k))) {
      return 'CONTINENTAL';
    }
    return 'ANY';
  }

  /** Protein compatible with a given cuisine tag */
  private compatibleProtein(food: Food, cuisineTag: string, preference: string): boolean {
    const n = food.name.toLowerCase();
    const isVegPref = preference === 'Veg';
    const isNonVegPref = preference === 'Non-Veg';

    if (isVegPref && !food.isVegetarian) return false;
    if (isNonVegPref && food.isVegetarian) return false;

    switch (cuisineTag) {
      case 'SOUTH_INDIAN':
        // South Indian proteins: sambhar dal, curd, coconut chutney, idli-compatible proteins
        return ['dal', 'sambar', 'sambhar', 'curd', 'paneer', 'egg',
                'coconut', 'rajma', 'chana'].some(k => n.includes(k));
      case 'NORTH_ROTI':
        // Dal, paneer gravy, chicken curry, rajma, chana masala, bhindi, chole
        return ['dal', 'paneer', 'chicken', 'mutton', 'fish', 'rajma',
                'chana', 'chole', 'soya', 'tofu', 'egg'].some(k => n.includes(k));
      case 'NORTH_RICE':
        // Full curries like butter chicken, dal makhani, rajma
        return ['butter chicken', 'dal makhani', 'rajma', 'paneer', 'dal',
                'chicken curry', 'fish curry', 'mutton', 'chana',
                'palak paneer', 'matar'].some(k => n.includes(k));
      case 'CONTINENTAL':
        // Eggs, chicken breast, protein shake, greek yogurt
        return ['egg', 'chicken breast', 'tuna', 'protein', 'yogurt',
                'cottage cheese', 'tofu', 'omelette'].some(k => n.includes(k));
      default:
        return true;
    }
  }

  /** Vegetable side compatible with a given cuisine tag */
  private compatibleVeg(food: Food, cuisineTag: string): boolean {
    const n = food.name.toLowerCase();
    switch (cuisineTag) {
      case 'SOUTH_INDIAN':
        return ['kootu', 'avial', 'beans', 'cabbage', 'raw banana',
                'drumstick', 'spinach', 'broccoli'].some(k => n.includes(k));
      case 'NORTH_ROTI':
        // Dry sabji that goes with roti
        return ['bhindi', 'aloo', 'gobi', 'baingan', 'palak', 'matar',
                'beans', 'capsicum', 'carrot', 'lauki'].some(k => n.includes(k));
      case 'NORTH_RICE':
        // Vegetables that go in rice meals
        return ['salad', 'raita', 'cucumber', 'tomato', 'spinach',
                'broccoli', 'palak', 'beans'].some(k => n.includes(k));
      case 'CONTINENTAL':
        return ['salad', 'broccoli', 'spinach', 'cucumber', 'tomato',
                'capsicum', 'mushroom', 'lettuce'].some(k => n.includes(k));
      default:
        return true;
    }
  }

  // =====================================================================
  // SMART MEAL BUILDER — cuisine-archetype aware
  // =====================================================================

  private generateSmartMeal(
    mealType: string,
    targetCalories: number,
    preference: string,
    dietType: string,
    macros: MacroTargets
  ): DietPlanMeal {
    let pool = this.foods();

    // Diet-type filter
    if (dietType === 'Fitness') {
      pool = pool.filter(f => this.isFitnessAppropriate(f));
    }

    const selected: DietPlanFood[] = [];
    let currentCalories = 0;

    if (mealType === 'Breakfast') {
      pool = pool.filter(f => this.isBreakfastAppropriate(f, preference));
      currentCalories = this.buildBreakfast(pool, targetCalories, preference, macros, selected);
    } else if (mealType === 'Lunch' || mealType === 'Dinner') {
      pool = pool.filter(f => this.isDinnerAppropriate(f));
      currentCalories = this.buildMainMeal(pool, targetCalories, preference, macros, selected);
    } else {
      pool = pool.filter(f => this.isSnackAppropriate(f));
      currentCalories = this.buildSnack(pool, targetCalories, selected);
    }

    return { mealType, calories: currentCalories, foods: selected };
  }

  private buildBreakfast(
    pool: Food[], targetCal: number, preference: string, macros: MacroTargets, out: DietPlanFood[]
  ): number {
    let cal = 0;
    let budget = targetCal;

    // -- Step 1: Select anchor grain and detect its cuisine style --
    const grainPool = pool.filter(f => f.isVegetarian && f.category === 'grains');
    const grainTarget = budget * 0.50;
    const grain = this.pickScoredFood(grainPool, grainTarget, 0);
    let cuisineTag = 'ANY';

    if (grain) {
      cuisineTag = this.getCuisineTag(grain);
      out.push(this.foodToPlanFood(grain));
      cal += grain.calories;
      budget -= grain.calories;
    }

    // -- Step 2: Pick a cuisine-compatible protein/side --
    // For breakfast: if South Indian, pair with sambhar/coconut chutney/curd
    // If Continental, pair with eggs/yogurt etc.
    const proteinPool = pool.filter(f => {
      if (f.category !== 'protein' && f.category !== 'dairy') return false;
      return this.compatibleProtein(f, cuisineTag, preference);
    });

    const proteinTarget = Math.max(20, budget * 0.55);
    const protein = this.pickScoredFood(proteinPool, proteinTarget, 1);
    if (protein) {
      out.push(this.foodToPlanFood(protein));
      cal += protein.calories;
      budget -= protein.calories;
    }

    // -- Step 3: Add a light fruit or beverage if budget remains --
    if (budget > 30) {
      const sidePool = pool.filter(f => ['fruits', 'beverages'].includes(f.category) && f.isVegetarian);
      const side = this.pickScoredFood(sidePool, budget, 2);
      if (side) { out.push(this.foodToPlanFood(side)); cal += side.calories; }
    }

    return cal;
  }

  /** Lunch / Dinner: cuisine-archetype aware */
  private buildMainMeal(
    pool: Food[], targetCal: number, preference: string, macros: MacroTargets, out: DietPlanFood[]
  ): number {
    let cal = 0;
    let budget = targetCal;

    // -- Step 1: Pick anchor grain and detect cuisine --
    const grainPool = pool.filter(f => f.isVegetarian && f.category === 'grains');
    const grainTarget = budget * 0.40;
    const grain = this.pickScoredFood(grainPool, grainTarget, 10);
    let cuisineTag = 'ANY';

    if (grain) {
      cuisineTag = this.getCuisineTag(grain);
      out.push(this.foodToPlanFood(grain));
      cal += grain.calories;
      budget -= grain.calories;
    }

    // -- Step 2: Pick a cuisine-compatible protein (dal/curry/meat) --
    // This is the CURRY/PROTEIN that goes alongside the grain
    const proteinPool = pool.filter(f => {
      if (f.category !== 'protein') return false;
      return this.compatibleProtein(f, cuisineTag, preference);
    });
    // Fallback: any protein matching preference
    const fallbackProteinPool = pool.filter(f => {
      if (f.category !== 'protein') return false;
      if (preference === 'Veg') return f.isVegetarian;
      if (preference === 'Non-Veg') return !f.isVegetarian;
      return true;
    });

    const proteinTarget = Math.max(40, budget * 0.55);
    const protein = this.pickScoredFood(
      proteinPool.length > 0 ? proteinPool : fallbackProteinPool,
      proteinTarget, 20
    );
    if (protein) {
      out.push(this.foodToPlanFood(protein));
      cal += protein.calories;
      budget -= protein.calories;
    }

    // -- Step 3: Pick a cuisine-compatible dry veggie side --
    // Only add if we have budget left and the cuisine typically has a dry side
    if (budget > 50 && ['NORTH_ROTI', 'NORTH_RICE', 'ANY'].includes(cuisineTag)) {
      const vegPool = pool.filter(f =>
        f.isVegetarian &&
        f.category === 'vegetables' &&
        this.compatibleVeg(f, cuisineTag)
      );
      const vegFallback = pool.filter(f => f.isVegetarian && f.category === 'vegetables');
      const vegTarget = Math.min(budget, targetCal * 0.20);
      const veg = this.pickScoredFood(
        vegPool.length > 0 ? vegPool : vegFallback,
        vegTarget, 30
      );
      if (veg) {
        out.push(this.foodToPlanFood(veg));
        cal += veg.calories;
        budget -= veg.calories;
      }
    }

    // -- Step 4: Optional dairy if budget allows (curd/raita with Indian meals) --
    if (budget > 40 && budget < 200 && ['NORTH_ROTI', 'NORTH_RICE', 'SOUTH_INDIAN'].includes(cuisineTag)) {
      const dairyPool = pool.filter(f =>
        f.isVegetarian && f.category === 'dairy' &&
        ['curd', 'yogurt', 'raita', 'chaas', 'buttermilk', 'lassi'].some(k => f.name.toLowerCase().includes(k))
      );
      if (dairyPool.length > 0) {
        const dairy = this.pickScoredFood(dairyPool, budget, 40);
        if (dairy) { out.push(this.foodToPlanFood(dairy)); cal += dairy.calories; }
      }
    }

    return cal;
  }

  private buildSnack(pool: Food[], targetCal: number, out: DietPlanFood[]): number {
    let cal = 0;
    let budget = targetCal;

    const snackPool = pool.filter(f => f.isVegetarian &&
      ['snacks', 'fruits', 'fats'].includes(f.category));
    const bevPool = pool.filter(f => f.isVegetarian && f.category === 'beverages');

    const snack = this.pickScoredFood(snackPool, budget, 50);
    if (snack) { 
      out.push(this.foodToPlanFood(snack)); 
      cal += snack.calories;
      budget -= snack.calories;
    }

    if (budget > 10) {
      const bev = this.pickScoredFood(bevPool, budget, 60);
      if (bev) { out.push(this.foodToPlanFood(bev)); cal += bev.calories; }
    }

    return cal;
  }

  // =====================================================================
  // MULTI-FACTOR FOOD SCORING
  // Calorie proximity (40%) + Protein density (40%) + Variety jitter (20%)
  // =====================================================================

  private pickScoredFood(foods: Food[], targetCal: number, seed: number): Food | null {
    if (foods.length === 0) return null;

    // Filter candidates: must be within a reasonable range (30% to 125% of target)
    // This prevents picking 500 kcal food when we want 200, or vice versa.
    let candidates = foods.filter(f => 
       f.calories >= targetCal * 0.30 && 
       f.calories <= targetCal * 1.25
    );

    // If no candidates in strict range, use a wider range
    if (candidates.length === 0) {
      candidates = foods.filter(f => f.calories > 10);
    }
    
    if (candidates.length === 0) return null;

    const rngBase = (Date.now() + seed * 137) % 1000;

    let best: Food | null = null;
    let bestScore = -Infinity;

    for (const food of candidates) {
      const calDiff = food.calories - targetCal;
      
      // Calorie score (0-1). Penalize overshooting more heavily than undershooting.
      let calScore: number;
      if (calDiff > 0) {
        calScore = Math.max(0, 1 - (calDiff * 1.5) / targetCal);
      } else {
        calScore = Math.max(0, 1 - Math.abs(calDiff) / targetCal);
      }

      const proteinScore = Math.min(food.protein / 50, 1);

      const nameHash = food.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const varietyScore = ((nameHash + rngBase) % 100) / 100;

      // Calories given higher weight (60%) to ensure target adherence
      const totalScore = calScore * 0.60 + proteinScore * 0.25 + varietyScore * 0.15;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        best = food;
      }
    }

    // Fallback: Pick the one with the literal minimum calorie difference, ignore macros
    if (!best) {
      best = candidates.reduce((prev, curr) => 
        Math.abs(curr.calories - targetCal) < Math.abs(prev.calories - targetCal) ? curr : prev
      );
    }

    return best;
  }

  // =====================================================================
  // PERSONALIZED COACH TIPS
  // =====================================================================

  private getCoachTip(
    goal: string,
    dietType: string,
    preference: string,
    macros: MacroTargets,
    targetCalories: number
  ): string {
    const proteinG = Math.round((targetCalories * macros.proteinPct) / 4);

    const tips: Record<string, Record<string, string>> = {
      'Weight Loss': {
        'Fitness':     `🔥 High-protein cut at ${proteinG}g protein/day. Eat slowly, chew well, and keep dinner the lightest meal. Consistency over perfection!`,
        'Traditional': `🍛 Smart calorie deficit with traditional Indian foods. Focus on dal-roti portions and avoid second helpings. Your body will thank you!`,
        'Balanced':    `⚖️ Balanced deficit plan. Plenty of fiber from veggies and legumes will keep you full. Aim for 3L water daily to curb cravings.`,
      },
      'Weight Gain': {
        'Fitness':     `💪 Lean bulk at ${proteinG}g protein/day! Never skip a meal — consistent calorie surplus every day builds mass. Post-workout nutrition is critical.`,
        'Traditional': `🌾 Desi bulk strategy! Finish all your meals. Add an extra roti or cup of rice if you're still hungry. Sleep 8 hours for maximum muscle growth.`,
        'Balanced':    `📈 Steady surplus plan. Always include protein at every meal. Add nuts and seeds to snacks for calorie-dense, healthy gains.`,
      },
      'Maintain': {
        'Fitness':     `🏃 Clean maintenance mode — ${proteinG}g protein keeps your muscle intact. Adjust portions based on your activity level each day.`,
        'Traditional': `🍱 Traditional maintenance done right. Enjoy your meals mindfully — one cheat meal a week stays within your goals. Track weekly, not daily!`,
        'Balanced':    `✨ Balanced lifestyle plan — sustainable long term. Swap one food each week to keep nutrition varied and exciting.`,
      }
    };

    const prefSuffix =
      preference === 'Non-Veg'
        ? ' Lean meats like chicken breast and fish give you high satiety with excellent protein quality.'
        : preference === 'Veg'
        ? ' Combine dal + roti at meals for a complete amino acid profile — the classic Indian protein power combo!'
        : '';

    const base = tips[goal]?.[dietType] ?? `💧 Remember to drink at least 3 liters of water today!`;
    return base + prefSuffix;
  }

  private foodToPlanFood(food: Food): DietPlanFood {
    return {
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      serving: `${food.servingSize} ${food.servingUnit}`,
      isVegetarian: food.isVegetarian,
    };
  }
}
