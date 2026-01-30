import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, UtensilsCrossed, Search, Calendar } from 'lucide-angular';
import { DietService } from './diet.service';
import { MealLogComponent } from './components/meal-log/meal-log.component';
import { FoodSearchComponent } from './components/food-search/food-search.component';
import { DietPlannerComponent } from './components/diet-planner/diet-planner.component';

@Component({
  selector: 'app-diet',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    MealLogComponent,
    FoodSearchComponent,
    DietPlannerComponent
  ],
  templateUrl: './diet.component.html',
  styleUrls: ['./diet.component.css']
})
export class DietComponent implements OnInit {
  private dietService = inject(DietService);

  readonly UtensilsCrossed = UtensilsCrossed;
  readonly Search = Search;
  readonly Calendar = Calendar;

  currentView = signal<'meals' | 'search' | 'planner'>('meals');

  // Nutrition summary
  nutritionSummary = computed(() => this.dietService.getNutritionSummary());

  // Daily goals
  dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65
  };

  // Progress
  calorieProgress = computed(() => 
    Math.min((this.nutritionSummary().calories / this.dailyGoals.calories) * 100, 100)
  );

  proteinProgress = computed(() =>
    Math.min((this.nutritionSummary().protein / this.dailyGoals.protein) * 100, 100)
  );

  carbsProgress = computed(() =>
    Math.min((this.nutritionSummary().carbs / this.dailyGoals.carbs) * 100, 100)
  );

  fatProgress = computed(() =>
    Math.min((this.nutritionSummary().fat / this.dailyGoals.fat) * 100, 100)
  );

  ngOnInit() {
    // Load initial data
    this.dietService.getTodayMeals().subscribe();
    this.dietService.getFoodDatabase().subscribe();
  }

  showMeals() {
    this.currentView.set('meals');
  }

  showSearch() {
    this.currentView.set('search');
  }

  showPlanner() {
    this.currentView.set('planner');
  }

  refreshNutrition() {
    // Reload meals to update nutrition summary
    this.dietService.getTodayMeals().subscribe();
  }

  onPlanSaved() {
    // Switch to meals view and refresh
    this.showMeals();
    this.refreshNutrition();
  }

  onFoodAdded() {
    // Refresh nutrition summary
    this.refreshNutrition();
  }
}