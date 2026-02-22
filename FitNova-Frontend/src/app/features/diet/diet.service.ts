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
    const mealCalories = {
      breakfast: Math.round(targetCalories * 0.30),
      lunch:     Math.round(targetCalories * 0.35),
      snack:     Math.round(targetCalories * 0.10),
      dinner:    Math.round(targetCalories * 0.25),
    };

    const meals: DietPlanMeal[] = [
      this.generateSmartMeal('Breakfast', mealCalories.breakfast, preference, dietType, macros),
      this.generateSmartMeal('Lunch',     mealCalories.lunch,     preference, dietType, macros),
      this.generateSmartMeal('Snacks',    mealCalories.snack,     preference, dietType, macros),
      this.generateSmartMeal('Dinner',    mealCalories.dinner,    preference, dietType, macros),
    ];

    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
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
  // SMART MEAL BUILDER — macro-aware, strict preference, variety scoring
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

    // Meal-time filter
    if (mealType === 'Breakfast') {
      pool = pool.filter(f => this.isBreakfastAppropriate(f, preference));
    } else if (mealType === 'Dinner') {
      pool = pool.filter(f => this.isDinnerAppropriate(f));
    } else if (mealType === 'Snacks') {
      pool = pool.filter(f => this.isSnackAppropriate(f));
    }

    const selected: DietPlanFood[] = [];
    let currentCalories = 0;

    if (mealType === 'Breakfast') {
      currentCalories = this.buildBreakfast(pool, targetCalories, preference, macros, selected);
    } else if (mealType === 'Lunch' || mealType === 'Dinner') {
      currentCalories = this.buildMainMeal(pool, targetCalories, preference, macros, selected);
    } else {
      currentCalories = this.buildSnack(pool, targetCalories, selected);
    }

    return { mealType, calories: currentCalories, foods: selected };
  }

  /** Breakfast: grain + protein + fruit/dairy/beverage */
  private buildBreakfast(
    pool: Food[], targetCal: number, preference: string, macros: MacroTargets, out: DietPlanFood[]
  ): number {
    let cal = 0;
    const highProtein = macros.proteinPct >= 0.35;

    // Protein pool — strict preference
    let proteinPool: Food[];
    if (preference === 'Non-Veg') {
      // Eggs are the non-veg protein for breakfast
      proteinPool = pool.filter(f => !f.isVegetarian && f.category === 'protein');
      if (proteinPool.length === 0) proteinPool = pool.filter(f => f.category === 'protein');
    } else {
      proteinPool = pool.filter(f => f.isVegetarian && f.category === 'protein');
    }

    // Grains are always veg at breakfast
    const grainPool = pool.filter(f => f.isVegetarian && f.category === 'grains');
    const sidePool  = pool.filter(f => f.isVegetarian && ['fruits', 'dairy', 'beverages'].includes(f.category));

    const grainTarget   = targetCal * (highProtein ? 0.35 : 0.42);
    const proteinTarget = targetCal * (highProtein ? 0.42 : 0.32);

    const grain = this.pickScoredFood(grainPool, grainTarget, 0);
    if (grain) { out.push(this.foodToPlanFood(grain)); cal += grain.calories; }

    const protein = this.pickScoredFood(proteinPool, proteinTarget, 1);
    if (protein) { out.push(this.foodToPlanFood(protein)); cal += protein.calories; }

    const remaining = targetCal - cal;
    if (remaining > 20) {
      const side = this.pickScoredFood(sidePool, remaining, 2);
      if (side) { out.push(this.foodToPlanFood(side)); cal += side.calories; }
    }

    return cal;
  }

  /** Lunch / Dinner: grain + ENFORCED protein + vegetable + optional dairy */
  private buildMainMeal(
    pool: Food[], targetCal: number, preference: string, macros: MacroTargets, out: DietPlanFood[]
  ): number {
    let cal = 0;
    const highProtein = macros.proteinPct >= 0.35;

    // === PROTEIN — CORE RULE ===
    // Non-Veg: MUST be non-vegetarian protein (chicken, fish, mutton, eggs)
    // Veg: MUST be vegetarian protein (dal, paneer, soya, rajma, chana)
    // Both: any protein
    let proteinPool: Food[];
    if (preference === 'Non-Veg') {
      proteinPool = pool.filter(f => !f.isVegetarian && f.category === 'protein');
      if (proteinPool.length === 0) proteinPool = pool.filter(f => f.category === 'protein');
    } else if (preference === 'Veg') {
      proteinPool = pool.filter(f => f.isVegetarian && f.category === 'protein');
    } else {
      proteinPool = pool.filter(f => f.category === 'protein');
    }

    // Grains and veggies are ALWAYS veg regardless of preference (roti/rice veg is fine for everyone)
    const grainPool = pool.filter(f => f.isVegetarian && f.category === 'grains');
    const vegPool   = pool.filter(f => f.isVegetarian && f.category === 'vegetables');
    const dairyPool = pool.filter(f => f.isVegetarian && f.category === 'dairy');

    const grainTarget   = targetCal * (highProtein ? 0.28 : 0.36);
    const proteinTarget = targetCal * (highProtein ? 0.40 : 0.30);
    const vegTarget     = targetCal * 0.18;

    const grain = this.pickScoredFood(grainPool, grainTarget, 10);
    if (grain) { out.push(this.foodToPlanFood(grain)); cal += grain.calories; }

    const protein = this.pickScoredFood(proteinPool, proteinTarget, 20);
    if (protein) { out.push(this.foodToPlanFood(protein)); cal += protein.calories; }

    const veg = this.pickScoredFood(vegPool, vegTarget, 30);
    if (veg) { out.push(this.foodToPlanFood(veg)); cal += veg.calories; }

    const remaining = targetCal - cal;
    if (remaining > 40 && remaining < 220) {
      const dairy = this.pickScoredFood(dairyPool, remaining, 40);
      if (dairy) { out.push(this.foodToPlanFood(dairy)); cal += dairy.calories; }
    }

    return cal;
  }

  /** Snack: always veg-friendly — fruit/nut or light snack + optional drink */
  private buildSnack(pool: Food[], targetCal: number, out: DietPlanFood[]): number {
    let cal = 0;

    const snackPool = pool.filter(f => f.isVegetarian &&
      ['snacks', 'fruits', 'fats'].includes(f.category));
    const bevPool = pool.filter(f => f.isVegetarian && f.category === 'beverages');

    const snack = this.pickScoredFood(snackPool, targetCal * 0.80, 50);
    if (snack) { out.push(this.foodToPlanFood(snack)); cal += snack.calories; }

    const bevTarget = targetCal - cal;
    if (bevTarget > 10) {
      const bev = this.pickScoredFood(bevPool, bevTarget, 60);
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

    const candidates = targetCal > 20 ? foods.filter(f => f.calories > 5) : foods;
    if (candidates.length === 0) return null;

    // Variety: use current timestamp mod to pick different foods on each generate
    const rngBase = (Date.now() + seed * 137) % 1000;

    let best: Food | null = null;
    let bestScore = -Infinity;

    for (const food of candidates) {
      // 1. Calorie proximity score (0-1, higher = closer to target)
      const calDiff  = Math.abs(food.calories - targetCal);
      const calScore = Math.max(0, 1 - calDiff / Math.max(targetCal, 1));

      // 2. Protein density score (0-1, based on g protein per 100 kcal equivalent)
      const proteinScore = Math.min(food.protein / 50, 1);

      // 3. Variety jitter: deterministic per food name but varies per generation
      const nameHash    = food.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const varietyScore = ((nameHash + rngBase) % 100) / 100;

      const totalScore = calScore * 0.40 + proteinScore * 0.40 + varietyScore * 0.20;

      // Only consider foods with at least 25% of target calories
      if (totalScore > bestScore && food.calories >= targetCal * 0.20) {
        bestScore = totalScore;
        best = food;
      }
    }

    // Fallback: highest calorie available
    if (!best) {
      best = candidates.reduce((max, f) => f.calories > max.calories ? f : max, candidates[0]);
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
