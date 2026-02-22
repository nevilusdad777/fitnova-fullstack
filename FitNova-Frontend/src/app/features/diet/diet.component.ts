import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, UtensilsCrossed, Search, Calendar } from 'lucide-angular';
import { DietService } from './diet.service';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from '../../services/profile.service';
import { MealLogComponent } from './components/meal-log/meal-log.component';
import { FoodSearchComponent } from './components/food-search/food-search.component';
import { DietPlannerComponent } from './components/diet-planner/diet-planner.component';

@Component({
  selector: 'app-diet',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    MealLogComponent,
    FoodSearchComponent,
    DietPlannerComponent
  ],
  templateUrl: './diet.component.html',
  styleUrls: ['./diet.component.css']
})
export class DietComponent implements OnInit {
  private dietService    = inject(DietService);
  private authService    = inject(AuthService);
  private profileService = inject(ProfileService);
  private route          = inject(ActivatedRoute);

  readonly UtensilsCrossed = UtensilsCrossed;
  readonly Search          = Search;
  readonly Calendar        = Calendar;

  currentView = signal<'meals' | 'search' | 'planner'>('meals');

  // Nutrition summary (from logged meals)
  nutritionSummary = computed(() => this.dietService.getNutritionSummary());

  /**
   * Planned totals for today based on all meals in the log (completed or not).
   * This is used as the denominator in the summary labels.
   */
  plannedTotal = computed(() => {
    const meals = this.dietService.meals();
    return {
      calories: Math.round(meals.reduce((sum, m) => sum + m.totalCalories, 0)),
      protein:  Math.round(meals.reduce((sum, m) => sum + m.totalProtein, 0)),
      carbs:    Math.round(meals.reduce((sum, m) => sum + m.totalCarbs, 0)),
      fat:      Math.round(meals.reduce((sum, m) => sum + m.totalFat, 0)),
    };
  });

  /**
   * Daily goals — derived dynamically from the user's actual dailyCalorieTarget.
   * Uses standard 40C / 30P / 30F macro split.
   * Falls back to 2000 kcal defaults if profile not yet loaded.
   */
  dailyGoals = computed(() => {
    // Try the profile service first (most up-to-date after profile edits)
    const calcs = this.profileService.getCalculations();
    let calories = calcs.dailyCalorieTarget;

    // Fall back to AuthService currentUser (cached from login/localStorage)
    if (!calories || calories === 0) {
      const user = this.authService.currentUser();
      calories = user?.dailyCalorieTarget ?? 2000;
    }

    // Standard 40C / 30P / 30F macro split (matches our diet plan generator)
    // protein: 4 kcal/g, carbs: 4 kcal/g, fat: 9 kcal/g
    return {
      calories: Math.round(calories),
      protein:  Math.round((calories * 0.30) / 4),   // 30% from protein
      carbs:    Math.round((calories * 0.40) / 4),   // 40% from carbs
      fat:      Math.round((calories * 0.30) / 9),   // 30% from fat
    };
  });

  // Progress bars (cap at 100%)
  // Uses plannedTotal if available (>0), otherwise falls back to dailyGoals
  calorieProgress = computed(() => {
    const target = this.plannedTotal().calories || this.dailyGoals().calories || 2000;
    return Math.min((this.nutritionSummary().calories / target) * 100, 100);
  });

  proteinProgress = computed(() => {
    const target = this.plannedTotal().protein || this.dailyGoals().protein || 150;
    return Math.min((this.nutritionSummary().protein / target) * 100, 100);
  });

  carbsProgress = computed(() => {
    const target = this.plannedTotal().carbs || this.dailyGoals().carbs || 200;
    return Math.min((this.nutritionSummary().carbs / target) * 100, 100);
  });

  fatProgress = computed(() => {
    const target = this.plannedTotal().fat || this.dailyGoals().fat || 67;
    return Math.min((this.nutritionSummary().fat / target) * 100, 100);
  });

  ngOnInit() {
    // Read optional ?view= query param
    const viewParam = this.route.snapshot.queryParamMap.get('view') as 'meals' | 'search' | 'planner' | null;
    if (viewParam && ['meals', 'search', 'planner'].includes(viewParam)) {
      this.currentView.set(viewParam);
    }

    // Load meals and food database
    this.dietService.getTodayMeals().subscribe();
    this.dietService.getFoodDatabase().subscribe();

    // Load profile so dailyCalorieTarget is fresh from backend
    this.profileService.getProfile().subscribe();
  }

  showMeals()   { this.currentView.set('meals');   }
  showSearch()  { this.currentView.set('search');  }
  showPlanner() { this.currentView.set('planner'); }

  refreshNutrition() {
    this.dietService.getTodayMeals().subscribe();
  }

  onPlanSaved() {
    this.showMeals();
    this.refreshNutrition();
  }

  onFoodAdded() {
    this.refreshNutrition();
  }
}