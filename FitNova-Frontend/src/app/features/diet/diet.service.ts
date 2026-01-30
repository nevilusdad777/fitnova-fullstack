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
  quantity: number;
  unit: string;
  servingSize?: number;
}

export interface Food {
  _id: string;
  name: string;
  category: string;
  isVegetarian: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
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
}

export interface DietPlanMeal {
  mealType: string;
  calories: number;
  foods: DietPlanFood[];
}

export interface DietPlan {
  meals: DietPlanMeal[];
  totalCalories: number;
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

  // Get today's meals
  getTodayMeals(): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${this.apiUrl}/today`).pipe(
      tap(meals => this.meals.set(meals))
    );
  }

  // Get food database
  getFoodDatabase(): Observable<Food[]> {
    return this.http.get<Food[] | { data: Food[] }>(`${environment.apiUrl}/food`).pipe(
      map((response: Food[] | { data: Food[] }) => {
        // Handle both response formats: {data: [...]} or [...]
        return Array.isArray(response) ? response : response.data;
      }),
      tap(foods => this.foods.set(foods))
    );
  }

  // Add meal
  addMeal(mealData: { mealType: string; foods: any[] }): Observable<Meal> {
    console.log('Adding meal:', mealData);
    return this.http.post<Meal>(`${this.apiUrl}/log`, mealData).pipe(
      tap(newMeal => {
        console.log('Meal added:', newMeal);
        this.meals.update(current => [...current, newMeal]);
      })
    );
  }

  // Delete meal
  deleteMeal(mealId: string): Observable<any> {
    console.log('Service deleteMeal called with ID:', mealId);
    console.log('Delete URL:', `${this.apiUrl}/${mealId}`);
    return this.http.delete(`${this.apiUrl}/${mealId}`).pipe(
      tap((response) => {
        console.log('Delete response:', response);
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
      // If meal has completedFoodIndices, sum only those foods
      if (meal.completedFoodIndices && meal.completedFoodIndices.length > 0) {
        meal.foods.forEach((food, index) => {
          if (meal.completedFoodIndices!.includes(index)) {
            totalCalories += food.calories * food.quantity;
            totalProtein += food.protein * food.quantity;
            totalCarbs += food.carbs * food.quantity;
            totalFat += food.fat * food.quantity;
          }
        });
      }
      // If whole meal is completed (old behavior fallback)
      else if (meal.completed) {
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
    console.log('Service deleteFoodFromMeal called:', { mealId, foodIndex });
    
    // Get current meal
    const meal = this.meals().find(m => m._id === mealId);
    if (!meal) {
      return new Observable(observer => {
        observer.error({ message: 'Meal not found' });
        observer.complete();
      });
    }

    // Create new foods array without the deleted item
    const updatedFoods = meal.foods.filter((_, index) => index !== foodIndex);

    // Update completedFoodIndices to maintain sync with the updated foods array
    let updatedCompletedIndices: number[] = [];
    if (meal.completedFoodIndices && meal.completedFoodIndices.length > 0) {
      updatedCompletedIndices = meal.completedFoodIndices
        .filter(index => index !== foodIndex) // Remove the deleted item's index
        .map(index => index > foodIndex ? index - 1 : index); // Decrement indices after the deleted one
    }

    // Update the meal with new foods array and updated completedFoodIndices
    return this.http.put<Meal>(`${this.apiUrl}/${mealId}`, {
      mealType: meal.mealType,
      foods: updatedFoods,
      completedFoodIndices: updatedCompletedIndices
    }).pipe(
      tap((updatedMeal) => {
        console.log('Food item deleted, meal updated:', updatedMeal);
        this.meals.update(current => current.map(m => 
          m._id === mealId ? updatedMeal : m
        ));
      })
    );
  }

  // Generate diet plan
  generateDietPlan(goal: string, preference: string, targetCalories: number): DietPlan {
    const mealCalories = {
      breakfast: Math.round(targetCalories * 0.3),
      lunch: Math.round(targetCalories * 0.4),
      dinner: Math.round(targetCalories * 0.25),
      snack: Math.round(targetCalories * 0.05)
    };

    const meals: DietPlanMeal[] = [
      this.generateMeal('Breakfast', mealCalories.breakfast, preference),
      this.generateMeal('Lunch', mealCalories.lunch, preference),
      this.generateMeal('Dinner', mealCalories.dinner, preference),
      this.generateMeal('Snacks', mealCalories.snack, preference)
    ];

    return {
      meals,
      totalCalories: meals.reduce((sum, m) => sum + m.calories, 0)
    };
  }

  // Save diet plan
  saveDietPlan(plan: DietPlan): Observable<any> {
    console.log('Saving diet plan:', plan);
    const foodsArray = this.foods();
    const requests = plan.meals.map(meal => {
      const foods = meal.foods.map(food => {
        const dbFood = foodsArray.find(f => f.name === food.name);
        
        // Parse serving: "100 g" or "1 medium"
        const servingParts = food.serving.split(' ');
        const quantity = parseFloat(servingParts[0]) || 1;
        const unit = servingParts.slice(1).join(' ') || 'serving';
        
        // Ensure all numeric values are valid numbers, not NaN or undefined
        const calories = Number(food.calories) || 0;
        const protein = Number(food.protein) || 0;
        const carbs = Number(food.carbs) || 0;
        const fat = Number(food.fat) || 0;
        
        // CRITICAL FIX: quantity should always be 1 because food.calories
        // already represents the full serving amount. The backend will
        // multiply by quantity, so we must use 1 to avoid inflated values.
        const foodItem = {
          id: dbFood?._id || '',
          name: food.name || 'Unknown Food',
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          quantity: 1, // Always 1 - calories are already for the full serving
          unit: `${quantity} ${unit}` // Put serving size in the unit for display
        };
        
        console.log('Mapped food item:', foodItem);
        // Validate that all numeric fields are valid
        if (isNaN(foodItem.calories) || isNaN(foodItem.protein) || isNaN(foodItem.carbs) || isNaN(foodItem.fat)) {
          console.error('Invalid numeric values detected:', foodItem);
        }
        return foodItem;
      });

      const mealData = {
        mealType: meal.mealType.toLowerCase() === 'snacks' ? 'snack' : meal.mealType.toLowerCase(),
        foods
      };
      
      console.log('Adding meal:', mealData);
      return this.addMeal(mealData);
    });

    // Use forkJoin to wait for all requests
    if (requests.length === 0) {
      return new Observable(observer => {
        observer.error('No meals to save');
        observer.complete();
      });
    }

    return forkJoin(requests).pipe(
      tap(() => {
        // Reload meals after saving
        this.getTodayMeals().subscribe();
      })
    );
  }

  // Generate a single meal
  private generateMeal(mealType: string, targetCalories: number, preference: string): DietPlanMeal {
    let availableFoods = this.foods();

    if (preference === 'Veg') {
      availableFoods = availableFoods.filter(f => f.isVegetarian);
    } else if (preference === 'Non-Veg') {
      availableFoods = availableFoods.filter(f => !f.isVegetarian);
    }

    const selectedFoods: DietPlanFood[] = [];
    let currentCalories = 0;
    const shuffled = [...availableFoods].sort(() => 0.5 - Math.random());

    // Add foods until we reach target calories
    for (const food of shuffled) {
      if (currentCalories >= targetCalories) break;
      if (selectedFoods.length >= 3) break; // Max 3 foods per meal
      
      selectedFoods.push({
        name: food.name,
        calories: food.calories, // Don't multiply - this is per serving
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        serving: `${food.servingSize} ${food.servingUnit}`
      });
      currentCalories += food.calories;
    }

    return {
      mealType,
      calories: currentCalories,
      foods: selectedFoods
    };
  }
}
