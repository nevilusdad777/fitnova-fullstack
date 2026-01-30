import { Component, signal, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-angular';
import { DietService, Meal } from '../../diet.service';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

interface MealGroup {
  id: string;
  mealType: MealType;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  completed: boolean;
  foods: Array<{
    foodId: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: number;
    unit: string;
    servingSize?: number; // Add this to calculate actual amount
  }>;
  expanded: boolean;
  completedFoodIndices?: number[];
}

@Component({
  selector: 'app-meal-log',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './meal-log.component.html',
  styleUrls: ['./meal-log.component.css']
})
export class MealLogComponent implements OnInit {
  private dietService = inject(DietService);
  
  readonly Trash2 = Trash2;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  
  @Output() mealsUpdated = new EventEmitter<void>();
  
  mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  meals = signal<{ [key in MealType]: MealGroup[] }>({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snacks: []
  });

  ngOnInit() {
    this.loadMeals();
  }

  private loadMeals() {
    this.dietService.getTodayMeals().subscribe((meals: Meal[]) => {
      const grouped: { [key in MealType]: MealGroup[] } = {
        Breakfast: [],
        Lunch: [],
        Dinner: [],
        Snacks: []
      };

      meals.forEach(meal => {
        const type = this.capitalize(meal.mealType);
        if (type in grouped) {
          grouped[type as MealType].push({
            id: meal._id,
            mealType: type as MealType,
            totalCalories: meal.totalCalories,
            totalProtein: meal.totalProtein,
            totalCarbs: meal.totalCarbs,
            totalFat: meal.totalFat,
            completed: meal.completed || false,
            foods: meal.foods.map(food => ({
              foodId: food.id || food.foodId || '',
              name: food.name,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
              quantity: food.quantity,
              unit: food.unit,
              servingSize: food.servingSize
            })),
            expanded: false,
            completedFoodIndices: meal.completedFoodIndices || [] // Load from backend
          });
        }
      });

      this.meals.set(grouped);
    });
  }

  getMealTotal(mealType: MealType): number {
    return Math.round(this.meals()[mealType].reduce((sum, meal) => sum + meal.totalCalories, 0));
  }

  toggleMealExpansion(mealType: MealType, mealIndex: number) {
    this.meals.update(current => {
      const updated = { ...current };
      updated[mealType] = [...updated[mealType]];
      updated[mealType][mealIndex] = {
        ...updated[mealType][mealIndex],
        expanded: !updated[mealType][mealIndex].expanded
      };
      return updated;
    });
  }

  toggleFoodCompletion(mealType: MealType, mealIndex: number, foodIndex: number) {
    const meal = this.meals()[mealType][mealIndex];
    const mealId = meal.id;
    
    this.dietService.toggleFoodItemCompletion(mealId, foodIndex).subscribe({
      next: () => {
        this.loadMeals();
        this.mealsUpdated.emit();
        
        // After reloading, check if all food items are now complete
        setTimeout(() => {
          const updatedMeal = this.meals()[mealType][mealIndex];
          if (updatedMeal) {
            const allItemsComplete = updatedMeal.foods.length > 0 && 
              updatedMeal.completedFoodIndices?.length === updatedMeal.foods.length;
            
            // If all items are complete but meal is not marked complete, auto-complete the meal
            if (allItemsComplete && !updatedMeal.completed) {
              this.toggleMealCompletion(updatedMeal.id);
            }
            // If no items are complete and meal is marked complete, unmark the meal
            else if (updatedMeal.completedFoodIndices?.length === 0 && updatedMeal.completed) {
              this.toggleMealCompletion(updatedMeal.id);
            }
          }
        }, 100);
      },
      error: (err) => {
        console.error('Error toggling food completion:', err);
      }
    });
  }

  isFoodCompleted(meal: MealGroup, foodIndex: number): boolean {
    return meal.completedFoodIndices?.includes(foodIndex) || false;
  }

  toggleMealCompletion(mealId: string) {
    this.dietService.toggleMealCompletion(mealId).subscribe(() => {
      this.loadMeals();
      this.mealsUpdated.emit();
    });
  }

  deleteMeal(mealId: string) {
    if (confirm('Delete this entire meal?')) {
      console.log('Deleting meal with ID:', mealId);
      this.dietService.deleteMeal(mealId).subscribe({
        next: () => {
          console.log('Meal deleted successfully');
          this.loadMeals();
          this.mealsUpdated.emit();
        },
        error: (err) => {
          console.error('Error deleting meal:', err);
          alert('Failed to delete meal: ' + (err.error?.message || err.message || 'Unknown error'));
        }
      });
    }
  }

  getMealIcon(mealType: MealType): string {
    const icons = {
      Breakfast: '🌅',
      Lunch: '🌞',
      Dinner: '🌙',
      Snacks: '🍿'
    };
    return icons[mealType];
  }

  private capitalize(str: string): string {
    if (str === 'snack') return 'Snacks';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  deleteFoodItem(mealId: string, foodIndex: number, totalFoods: number) {
    // If this is the last food item, delete the entire meal instead
    if (totalFoods === 1) {
      if (confirm('This is the last item in this meal. Delete the entire meal?')) {
        this.deleteMeal(mealId);
      }
      return;
    }

    if (confirm('Remove this food item from the meal?')) {
      console.log('Deleting food item:', { mealId, foodIndex });
      this.dietService.deleteFoodFromMeal(mealId, foodIndex).subscribe({
        next: () => {
          console.log('Food item deleted successfully');
          this.loadMeals();
          this.mealsUpdated.emit();
        },
        error: (err) => {
          console.error('Error deleting food item:', err);
          alert('Failed to delete food item: ' + (err.error?.message || err.message || 'Unknown error'));
        }
      });
    }
  }

  getActualAmount(food: any): number {
    // If servingSize is stored, calculate actual amount
    // quantity is number of servings, so actual amount = quantity * servingSize
    if (food.servingSize) {
      return Math.round(food.quantity * food.servingSize * 100) / 100;
    }
    // Fallback to quantity if servingSize not available
    return Math.round(food.quantity * 100) / 100;
  }
}
