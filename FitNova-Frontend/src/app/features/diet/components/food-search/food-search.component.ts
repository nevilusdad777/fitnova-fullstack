import { Component, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus, Filter } from 'lucide-angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DietService } from '../../diet.service';
import { Food } from '../../../../core/models/diet.model';

import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-food-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BadgeComponent],
  templateUrl: './food-search.component.html',
  styleUrls: ['./food-search.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class FoodSearchComponent {
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Filter = Filter;

  @Output() foodAdded = new EventEmitter<void>();

  searchQuery = signal('');
  foodTypeFilter = signal<'All' | 'Veg' | 'Non-Veg'>('All');
  selectedCategory = signal<string>('All');
  
  sortField = signal<string>('calories');
  sortDirection = signal<'asc' | 'desc'>('desc');
  
  allFoods = signal<Food[]>([]);
  selectedFood = signal<Food | null>(null);
  selectedMealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' = 'Breakfast';
  amountInput: number = 100;

  categories = [
    'All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Beverages'
  ];

  sortFields = [
    { label: 'Calories', value: 'calories' },
    { label: 'Protein', value: 'protein' },
    { label: 'Carbs', value: 'carbs' },
    { label: 'Fats', value: 'fat' }
  ];

  filteredFoods = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const filter = this.foodTypeFilter();
    const category = this.selectedCategory();
    const field = this.sortField();
    const direction = this.sortDirection();
    
    let foods = this.allFoods();

    // Search
    if (query) {
      foods = foods.filter(food => 
        food.name.toLowerCase().includes(query)
      );
    }

    // Veg/Non-Veg
    if (filter !== 'All') {
      const isVeg = filter === 'Veg';
      foods = foods.filter(food => food.isVegetarian === isVeg);
    }

    // Category
    if (category !== 'All') {
      foods = foods.filter(food => food.category.toLowerCase() === category.toLowerCase());
    }

    // Sort
    foods = [...foods].sort((a, b) => {
        const aValue = (a as any)[field] || 0;
        const bValue = (b as any)[field] || 0;
        return direction === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return foods;
  });

  constructor(private dietService: DietService) {}

  ngOnInit() {
    this.dietService.getFoodDatabase().subscribe(foods => {
        this.allFoods.set(foods);
    });
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  setFoodTypeFilter(filter: 'All' | 'Veg' | 'Non-Veg') {
    this.foodTypeFilter.set(filter);
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  setSortField(field: string) {
    this.sortField.set(field);
  }

  setSortDirection(direction: 'asc' | 'desc') {
    this.sortDirection.set(direction);
  }

  resetFilters() {
    this.searchQuery.set('');
    this.foodTypeFilter.set('All');
    this.selectedCategory.set('All');
    this.sortField.set('calories');
    this.sortDirection.set('desc');
  }

  selectFood(food: Food) {
    this.selectedFood.set(food);
    this.amountInput = food.servingSize;
    // Prevent parent scrolling and overflow clipping
    const dietMain = document.querySelector('.diet-main');
    if (dietMain) {
      (dietMain as HTMLElement).style.overflow = 'visible';
    }
  }

  closeModal() {
    this.selectedFood.set(null);
    // Restore parent scrolling
    const dietMain = document.querySelector('.diet-main');
    if (dietMain) {
      (dietMain as HTMLElement).style.overflow = '';
    }
  }

  addToMeal() {
    const food = this.selectedFood();
    if (!food) return;

    // Calculate servings
    // If user enters 50g and serving is 100g, qty = 0.5
    // If they enter 0, default to 0
    const qty = this.amountInput / (food.servingSize || 1);

    const mealData = {
      mealType: this.selectedMealType.toLowerCase(),
      foods: [{
          id: food._id, // Add required id field
          foodId: food._id,
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          unit: food.servingUnit,
          quantity: Math.max(qty, 0.01), // Ensure minimum value (number of servings)
          servingSize: food.servingSize // Store to calculate display amount later
      }]
    };

    this.dietService.addMeal(mealData).subscribe({
        next: () => {
            alert('Food added successfully!');
            this.foodAdded.emit();
            this.closeModal();
        },
        error: (err) => {
            console.error('Error adding food:', err);
            alert('Failed to add food. Please try again.');
        }
    });
  }
  handleImageError(food: Food) {
    food.image = undefined;
  }
}