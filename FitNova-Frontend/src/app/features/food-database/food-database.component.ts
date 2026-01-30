import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Filter, Plus, X } from 'lucide-angular';
import { DietService, Food } from '../diet/diet.service';

@Component({
  selector: 'app-food-database',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './food-database.component.html',
  styleUrls: ['./food-database.component.css']
})
export class FoodDatabaseComponent implements OnInit {
  private dietService = inject(DietService);
  private router = inject(Router);

  readonly Search = Search;
  readonly Filter = Filter;
  readonly Plus = Plus;
  readonly X = X;

  // All foods
  allFoods = signal<Food[]>([]);
  
  // Filters
  searchQuery = signal('');
  vegFilter = signal<'all' | 'veg' | 'non-veg'>('all');
  
  // Modal state
  selectedFood = signal<Food | null>(null);
  selectedMealType = signal<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  quantity = signal(1);
  isAdding = signal(false);

  // Filtered foods
  filteredFoods = computed(() => {
    let foods = this.allFoods();
    
    // Search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      foods = foods.filter(f => f.name.toLowerCase().includes(query));
    }
    
    // Veg filter
    const filter = this.vegFilter();
    if (filter === 'veg') {
      foods = foods.filter(f => f.isVegetarian);
    } else if (filter === 'non-veg') {
      foods = foods.filter(f => !f.isVegetarian);
    }
    
    return foods;
  });

  ngOnInit() {
    this.loadFoods();
  }

  loadFoods() {
    this.dietService.getFoodDatabase().subscribe(() => {
      this.allFoods.set(this.dietService.foods());
    });
  }

  openModal(food: Food) {
    this.selectedFood.set(food);
    this.quantity.set(1);
    this.selectedMealType.set('breakfast');
  }

  closeModal() {
    this.selectedFood.set(null);
    this.isAdding.set(false);
  }

  addToMeal() {
    const food = this.selectedFood();
    if (!food || this.isAdding()) return;

    this.isAdding.set(true);

    const mealData = {
      mealType: this.selectedMealType(),
      foods: [{
        foodId: food._id,
        id: food._id,
        name: food.name,
        calories: food.calories * this.quantity(),
        protein: food.protein * this.quantity(),
        carbs: food.carbs * this.quantity(),
        fat: food.fat * this.quantity(),
        quantity: food.servingSize * this.quantity(),
        unit: food.servingUnit
      }]
    };

    console.log('Submitting meal:', mealData);

    this.dietService.addMeal(mealData).subscribe({
      next: (response) => {
        console.log('Meal added successfully!', response);
        this.closeModal();
        
        // Reload meals to show the new one
        this.dietService.getTodayMeals().subscribe(() => {
          // Navigate to diet page meals view
          this.router.navigate(['/diet']);
        });
      },
      error: (err: any) => {
        console.error('Error adding meal:', err);
        this.isAdding.set(false);
        alert('Failed to add food. Please try again.');
      }
    });
  }
}
