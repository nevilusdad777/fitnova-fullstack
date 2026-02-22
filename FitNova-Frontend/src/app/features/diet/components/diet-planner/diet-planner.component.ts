import { Component, signal, computed, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Sparkles, Download, Flame, Dumbbell, Target,
  Loader, ChefHat, TrendingDown, TrendingUp, Minus
} from 'lucide-angular';
import { DietService, DietPlan, MacroTargets } from '../../diet.service';

@Component({
  selector: 'app-diet-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './diet-planner.component.html',
  styleUrls: ['./diet-planner.component.css']
})
export class DietPlannerComponent implements OnInit {
  readonly Sparkles   = Sparkles;
  readonly Download   = Download;
  readonly Flame      = Flame;
  readonly Dumbbell   = Dumbbell;
  readonly Target     = Target;
  readonly Loader     = Loader;
  readonly ChefHat    = ChefHat;
  readonly TrendingDown = TrendingDown;
  readonly TrendingUp   = TrendingUp;
  readonly Minus        = Minus;

  fitnessGoal       = signal<'Weight Loss' | 'Weight Gain' | 'Maintain'>('Weight Loss');
  foodPreference    = signal<'Veg' | 'Non-Veg' | 'Both'>('Both');
  dietType          = signal<'Traditional' | 'Fitness' | 'Balanced'>('Traditional');
  dailyCalorieTarget = signal(2000);

  generatedPlan     = signal<DietPlan | null>(null);
  isSaving          = signal(false);
  isGenerating      = signal(false);

  @Output() planSaved = new EventEmitter<void>();

  /** Live preview of expected macro targets (updates with pill selections) */
  macroPreview = computed<MacroTargets>(() => {
    return this.dietService.computeMacroGrams(
      this.dailyCalorieTarget(),
      this.dietService.getMacroTargets(this.fitnessGoal(), this.dietType())
    );
  });

  constructor(private dietService: DietService) {}

  ngOnInit() {
    this.dietService.getFoodDatabase().subscribe({
      error: () => alert('Failed to load food database. Please refresh.')
    });
  }

  generatePlan() {
    if (this.dietService.foods().length === 0) {
      alert('Food database is still loading. Please wait a moment and try again.');
      return;
    }

    this.isGenerating.set(true);
    this.generatedPlan.set(null);

    // Small delay for UX (shows spinner)
    setTimeout(() => {
      const plan = this.dietService.generateDietPlan(
        this.fitnessGoal(),
        this.foodPreference(),
        this.dailyCalorieTarget(),
        this.dietType()
      );
      this.generatedPlan.set(plan);
      this.isGenerating.set(false);
    }, 600);
  }

  savePlan() {
    const plan = this.generatedPlan();
    if (!plan) return;

    this.isSaving.set(true);
    this.dietService.saveDietPlan(plan).subscribe({
      next: () => {
        this.isSaving.set(false);
        alert('Diet plan saved! Check your meals log.');
        this.planSaved.emit();
        this.generatedPlan.set(null);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error saving plan:', err);
        alert('Failed to save plan. Please try again.');
      }
    });
  }

  getMealIcon(mealType: string): string {
    const icons: { [key: string]: string } = {
      Breakfast: '🌅', Lunch: '🌞', Dinner: '🌙', Snacks: '🍎'
    };
    return icons[mealType] || '🍽️';
  }

  getGoalIcon(): string {
    const g = this.fitnessGoal();
    if (g === 'Weight Loss') return '🔥';
    if (g === 'Weight Gain') return '💪';
    return '⚖️';
  }

  getGoalDescription(): string {
    const g = this.fitnessGoal();
    const d = this.dietType();
    if (g === 'Weight Loss') return d === 'Fitness' ? 'High-protein fat-loss' : 'Calorie-deficit plan';
    if (g === 'Weight Gain') return d === 'Fitness' ? 'Lean muscle bulk' : 'Mass building plan';
    return d === 'Fitness' ? 'Clean maintenance' : 'Balance & sustain';
  }

  getTotalMacro(plan: DietPlan, macro: 'protein' | 'carbs' | 'fat'): number {
    return Math.round(plan.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + food[macro], 0), 0
    ));
  }

  getMealMacro(meal: any, macro: 'protein' | 'carbs' | 'fat'): number {
    return Math.round(meal.foods.reduce((sum: number, food: any) => sum + food[macro], 0));
  }

  getMealCaloriePct(meal: any): number {
    return Math.round((meal.calories / this.dailyCalorieTarget()) * 100);
  }

  getProteinAccuracy(plan: DietPlan): number {
    const actual = this.getTotalMacro(plan, 'protein');
    const target = this.macroPreview().proteinG;
    return target > 0 ? Math.min(Math.round((actual / target) * 100), 100) : 0;
  }

  getCalorieAccuracy(plan: DietPlan): number {
    return Math.min(Math.round((plan.totalCalories / this.dailyCalorieTarget()) * 100), 100);
  }

  /** Returns true if a food item is a non-veg protein source */
  isNonVegProtein(food: any): boolean {
    return food.isVegetarian === false;
  }
}