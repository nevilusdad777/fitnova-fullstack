import { Component, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus, Filter, PlusCircle, X, Pencil, Trash2 } from 'lucide-angular';
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
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class FoodSearchComponent {
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Filter = Filter;
  readonly PlusCircle = PlusCircle;
  readonly X = X;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  @Output() foodAdded = new EventEmitter<void>();

  searchQuery = signal('');
  foodTypeFilter = signal<'All' | 'Veg' | 'Non-Veg'>('All');
  selectedCategory = signal<string>('All');
  
  sortField = signal<string>('calories');
  sortDirection = signal<'asc' | 'desc'>('desc');
  
  allFoods = signal<Food[]>([]);
  // Reads directly from the service signal so edits/deletes reflect instantly
  myCustomFoods = computed(() => this.dietService.customFoods());
  selectedFood = signal<Food | null>(null);
  selectedMealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' = 'Breakfast';
  amountInput: number = 100;

  // Create custom food modal
  showCustomFoodModal = signal(false);
  isSubmittingCustomFood = signal(false);
  customFoodError = signal('');

  // Edit custom food modal
  showEditModal = signal(false);
  editingFoodId = signal<string | null>(null);
  isSubmittingEdit = signal(false);
  editFoodError = signal('');
  editFoodForm = {
    name: '',
    description: '',
    category: 'protein',
    isVegetarian: true,
    calories: null as number | null,
    protein: null as number | null,
    carbs: null as number | null,
    fat: null as number | null,
    fiber: 0,
    servingSize: null as number | null,
    servingUnit: 'g'
  };

  customFoodForm = {
    name: '',
    description: '',
    category: 'protein',
    isVegetarian: true,
    calories: null as number | null,
    protein: null as number | null,
    carbs: null as number | null,
    fat: null as number | null,
    fiber: 0,
    servingSize: null as number | null,
    servingUnit: 'g'
  };

  categories = [
    'All', 'Grains', 'Protein', 'Vegetables', 'Fruits', 'Dairy', 'Fats', 'Snacks', 'Beverages'
  ];

  foodCategories = [
    { label: 'Grains', value: 'grains' },
    { label: 'Protein', value: 'protein' },
    { label: 'Vegetables', value: 'vegetables' },
    { label: 'Fruits', value: 'fruits' },
    { label: 'Dairy', value: 'dairy' },
    { label: 'Fats', value: 'fats' },
    { label: 'Snacks', value: 'snacks' },
    { label: 'Beverages', value: 'beverages' }
  ];

  servingUnits = ['g', 'ml', 'cup', 'piece', 'tbsp', 'tsp', 'oz', 'glass', 'pack', 'scoop', 'serving'];

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
    
    // Exclude user-created foods from the main database grid
    let foods = this.allFoods().filter(f => f.apiSource !== 'user');

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

  filteredCustomFoods = computed(() => {
    const query = this.searchQuery().toLowerCase();
    let foods = this.myCustomFoods();
    if (query) {
      foods = foods.filter(f => f.name.toLowerCase().includes(query));
    }
    return foods;
  });

  constructor(private dietService: DietService) {}

  ngOnInit() {
    this.dietService.getFoodDatabase().subscribe(foods => {
        this.allFoods.set(foods);
    });
    // Load custom foods into the service signal (component reads it via computed above)
    this.dietService.getMyCustomFoods().subscribe();
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

  // ── Custom Food Modal ──────────────────────────────────────────────────

  openCustomFoodModal() {
    this.customFoodForm = {
      name: '',
      description: '',
      category: 'protein',
      isVegetarian: true,
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      fiber: 0,
      servingSize: null,
      servingUnit: 'g'
    };
    this.customFoodError.set('');
    this.showCustomFoodModal.set(true);
  }

  closeCustomFoodModal() {
    this.showCustomFoodModal.set(false);
    this.customFoodError.set('');
  }

  submitCustomFood() {
    const f = this.customFoodForm;

    // Validation
    if (!f.name.trim()) {
      this.customFoodError.set('Food name is required.');
      return;
    }
    if (f.calories === null || f.calories < 0) {
      this.customFoodError.set('Please enter valid calories.');
      return;
    }
    if (f.protein === null || f.protein < 0) {
      this.customFoodError.set('Please enter valid protein.');
      return;
    }
    if (f.carbs === null || f.carbs < 0) {
      this.customFoodError.set('Please enter valid carbs.');
      return;
    }
    if (f.fat === null || f.fat < 0) {
      this.customFoodError.set('Please enter valid fat.');
      return;
    }
    if (!f.servingSize || f.servingSize <= 0) {
      this.customFoodError.set('Please enter a valid serving size.');
      return;
    }

    this.customFoodError.set('');
    this.isSubmittingCustomFood.set(true);

    const payload = {
      name: f.name.trim(),
      description: f.description?.trim() || '',
      category: f.category,
      isVegetarian: f.isVegetarian,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      fiber: f.fiber || 0,
      servingSize: f.servingSize,
      servingUnit: f.servingUnit
    };

    this.dietService.createCustomFood(payload).subscribe({
      next: (_newFood) => {
        this.isSubmittingCustomFood.set(false);
        this.closeCustomFoodModal();
      },
      error: (err) => {
        this.isSubmittingCustomFood.set(false);
        this.customFoodError.set(err?.error?.message || 'Failed to create food. Please try again.');
      }
    });
  }


  // ── Edit Custom Food ──────────────────────────────────────────────────

  openEditModal(food: Food, event: Event) {
    event.stopPropagation(); // prevent card click (add-to-meal modal)
    this.editingFoodId.set(food._id);
    this.editFoodForm = {
      name: food.name,
      description: food.description || '',
      category: food.category,
      isVegetarian: food.isVegetarian,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit
    };
    this.editFoodError.set('');
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingFoodId.set(null);
    this.editFoodError.set('');
  }

  submitEditFood() {
    const id = this.editingFoodId();
    if (!id) return;
    const f = this.editFoodForm;

    if (!f.name.trim()) { this.editFoodError.set('Food name is required.'); return; }
    if (f.calories === null || f.calories < 0) { this.editFoodError.set('Please enter valid calories.'); return; }
    if (f.protein === null || f.protein < 0) { this.editFoodError.set('Please enter valid protein.'); return; }
    if (f.carbs === null || f.carbs < 0) { this.editFoodError.set('Please enter valid carbs.'); return; }
    if (f.fat === null || f.fat < 0) { this.editFoodError.set('Please enter valid fat.'); return; }
    if (!f.servingSize || f.servingSize <= 0) { this.editFoodError.set('Please enter a valid serving size.'); return; }

    this.editFoodError.set('');
    this.isSubmittingEdit.set(true);

    const payload = {
      name: f.name.trim(),
      description: f.description?.trim() || '',
      category: f.category,
      isVegetarian: f.isVegetarian,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      fiber: f.fiber || 0,
      servingSize: f.servingSize,
      servingUnit: f.servingUnit
    };

    this.dietService.updateCustomFood(id, payload).subscribe({
      next: () => {
        this.isSubmittingEdit.set(false);
        this.closeEditModal();
      },
      error: (err) => {
        this.isSubmittingEdit.set(false);
        this.editFoodError.set(err?.error?.message || 'Failed to update food. Please try again.');
      }
    });
  }

  // ── Delete Custom Food ────────────────────────────────────────────────

  confirmDeleteFood(food: Food, event: Event) {
    event.stopPropagation();
    if (!confirm(`Delete "${food.name}"? This cannot be undone.`)) return;

    this.dietService.deleteCustomFood(food._id).subscribe({
      next: () => {},
      error: (err) => {
        alert(err?.error?.message || 'Failed to delete food.');
      }
    });
  }
}