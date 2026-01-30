import { Component, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Sparkles, Download } from 'lucide-angular';
import { DietService, DietPlan } from '../../diet.service';

@Component({
    selector: 'app-diet-planner',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './diet-planner.component.html',
    styleUrls: ['./diet-planner.component.css']
})
export class DietPlannerComponent implements OnInit {
    readonly Sparkles = Sparkles;
    readonly Download = Download;

    fitnessGoal = signal<'Weight Loss' | 'Weight Gain' | 'Maintain'>('Weight Loss');
    foodPreference = signal<'Veg' | 'Non-Veg' | 'Both'>('Both');
    dailyCalorieTarget = signal(2000);
    generatedPlan = signal<DietPlan | null>(null);

    @Output() planSaved = new EventEmitter<void>();
    isSaving = signal(false);

    constructor(private dietService: DietService) { }

    ngOnInit() {
        // Load food database on component init to ensure foods are available for plan generation
        this.dietService.getFoodDatabase().subscribe({
            error: (err) => {
                console.error('Error loading food database:', err);
                alert('Failed to load food database. Please refresh the page.');
            }
        });
    }

    generatePlan() {
        // Check if foods are loaded
        if (this.dietService.foods().length === 0) {
            alert('Food database is still loading. Please wait a moment and try again.');
            return;
        }
        
        const plan = this.dietService.generateDietPlan(
            this.fitnessGoal(),
            this.foodPreference(),
            this.dailyCalorieTarget()
        );
        this.generatedPlan.set(plan);
    }

    savePlan() {
        const plan = this.generatedPlan();
        if (!plan) return;

        this.isSaving.set(true);
        this.dietService.saveDietPlan(plan).subscribe({
            next: () => {
                this.isSaving.set(false);
                alert('Diet plan saved successfully! Check your meals log.');
                this.planSaved.emit();
                // Clear the generated plan after saving
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
            Breakfast: '🌅',
            Lunch: '🌞',
            Dinner: '🌙',
            Snacks: '🍿'
        };
        return icons[mealType] || '🍽️';
    }
}