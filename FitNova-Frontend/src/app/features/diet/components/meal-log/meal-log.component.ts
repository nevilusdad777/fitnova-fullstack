import { Component, signal, inject, OnInit, OnDestroy, Output, EventEmitter, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trash2, Check, ChevronDown, ChevronUp, Edit2, X, Plus, Search, Save } from 'lucide-angular';
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
    fiber: number;
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
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './meal-log.component.html',
  styleUrls: ['./meal-log.component.css']
})
export class MealLogComponent implements OnInit, OnDestroy {
  private dietService = inject(DietService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  
  readonly Trash2 = Trash2;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Edit2 = Edit2;
  readonly X = X;
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Save = Save;
  
  // Modal Editing state
  editMeal = signal<MealGroup | null>(null);
  editFoods = signal<any[]>([]);
  isSaving = signal(false);
  
  // Food Search in Edit Modal
  allFoods = signal<any[]>([]);
  filteredFoods = signal<any[]>([]);
  showFoodSearch = signal(false);
  searchQuery = signal('');
  
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
    this.loadAllFoods();
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'modal-open');
  }

  private loadAllFoods() {
    this.dietService.getFoodDatabase().subscribe({
      next: (foods) => {
        this.allFoods.set(foods);
        this.filteredFoods.set(foods.slice(0, 20));
      }
    });
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
            foods: meal.foods.map(food => {
              let servingSize = food.servingSize;
              let unit = food.unit || 'g';
              let quantity = food.quantity;

              // Force parsing if unit looks like "100 g" even if servingSize exists (to fix bad data)
              if (unit.match(/^\d+/) && (!servingSize || servingSize === 1)) {
                const match = unit.match(/^(\d+)\s*(.*)/);
                if (match) {
                  servingSize = parseFloat(match[1]);
                  unit = match[2] || 'g';
                }
              }

              // Final cleanup: if unit is "gm", "GM", "gms" -> "g"
              unit = unit.toLowerCase().replace(/gms?|gm/, 'g').trim();

              return {
                foodId: food.id || food.foodId || '',
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                fiber: food.fiber || 0,
                quantity: quantity,
                unit: unit,
                servingSize: servingSize || 100 // Default to 100 for safety
              };
            }),
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
    const multiplier = food.servingSize || 1;
    let total = food.quantity * multiplier;
    
    // If it's a very small amount (like pieces), don't round too much
    if (total < 10) return Math.round(total * 10) / 10;
    return Math.round(total);
  }

  // Modal Edit Methods
  openEdit(meal: MealGroup) {
    this.editMeal.set(meal);
    const foods = meal.foods.map(f => ({
      ...f,
      portionAmount: Math.round((f.quantity * (f.servingSize || 1)) * 10) / 10
    }));
    this.editFoods.set(foods);
    this.showFoodSearch.set(false);
    this.renderer.addClass(this.document.body, 'modal-open');
  }

  closeEdit() {
    this.editMeal.set(null);
    this.showFoodSearch.set(false);
    this.searchQuery.set('');
    this.renderer.removeClass(this.document.body, 'modal-open');
  }

  removeEditFood(index: number) {
    const current = [...this.editFoods()];
    current.splice(index, 1);
    this.editFoods.set(current);
  }

  toggleFoodSearch() {
    this.showFoodSearch.set(!this.showFoodSearch());
    if (this.showFoodSearch()) {
      this.filterFoods();
    }
  }

  onSearchInput(event: any) {
    this.searchQuery.set(event.target.value);
    this.filterFoods();
  }

  filterFoods() {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      this.filteredFoods.set(this.allFoods().slice(0, 20));
      return;
    }
    
    const filtered = this.allFoods().filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.category?.toLowerCase().includes(query)
    );
    this.filteredFoods.set(filtered.slice(0, 50));
  }

  addFoodToEdit(food: any) {
    const current = [...this.editFoods()];
    
    // Check if food already exists in this edit session
    const existing = current.find(f => f.foodId === food._id || f.name === food.name);
    if (existing) {
        alert('This food is already in your meal. You can adjust its quantity.');
        return;
    }

    // Clean up unit: if it's "100 g", just use "g"
    let unit = food.servingUnit || 'g';
    if (unit.match(/^\d+\s+\w+/)) {
      unit = unit.split(/\s+/).slice(1).join(' ');
    }

    current.push({
      foodId: food._id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      quantity: 1, 
      unit: unit,
      servingSize: food.servingSize || 100,
      portionAmount: food.servingSize || 100
    });

    this.editFoods.set(current);
    this.showFoodSearch.set(false);
    this.searchQuery.set('');
  }

  getFoodAmount(food: any): number {
    return Math.round((food.quantity * (food.servingSize || 1)) * 10) / 10;
  }

  onAmountInput(food: any, event: any) {
    const val = parseFloat(event.target.value);
    if (!isNaN(val) && val > 0) {
      food.quantity = val / (food.servingSize || 1);
    }
  }

  saveMealEdit() {
    const meal = this.editMeal();
    if (!meal) return;

    this.isSaving.set(true);

    const payload = {
      mealType: meal.mealType.toLowerCase().replace('snacks', 'snack'),
      foods: this.editFoods().map(f => {
        const finalQuantity = f.portionAmount / (f.servingSize || 1);
        return {
          ...f,
          id: f.foodId || f.id,
          quantity: finalQuantity
        };
      }),
      completedFoodIndices: meal.completedFoodIndices || []
    };

    this.dietService.updateMeal(meal.id, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeEdit();
        this.loadMeals();
        this.mealsUpdated.emit();
      },
      error: (err) => {
        console.error('Error saving meal edit:', err);
        this.isSaving.set(false);
        alert('Failed to save changes. Please try again.');
      }
    });
  }
}
