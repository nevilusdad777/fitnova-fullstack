import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Sparkles, Save, Info } from 'lucide-angular';
import { WorkoutService } from '../../workout.service';

interface SplitOption {
    id: string;
    name: string;
    description: string;
    daysPerWeek: number;
    icon: string;
}

@Component({
    selector: 'app-workout-plan-generator',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './workout-plan-generator.component.html',
    styleUrls: ['./workout-plan-generator.component.css']
})
export class WorkoutPlanGeneratorComponent {
    readonly Sparkles = Sparkles;
    readonly Save = Save;
    readonly Info = Info;

    @Output() planGenerated = new EventEmitter<void>();

    splitOptions: SplitOption[] = [
        {
            id: 'bro',
            name: 'Bro Split',
            description: '5 days - Classic bodybuilding split (Chest, Back, Shoulders, Arms, Legs)',
            daysPerWeek: 5,
            icon: '💪'
        },
        {
            id: 'ppl',
            name: 'Push/Pull/Legs',
            description: '6 days - High frequency training (Push, Pull, Legs × 2)',
            daysPerWeek: 6,
            icon: '🔁'
        },
        {
            id: 'upper-lower',
            name: 'Upper/Lower',
            description: '4 days - Balanced split (Upper × 2, Lower × 2)',
            daysPerWeek: 4,
            icon: '⚖️'
        },
        {
            id: 'full-body',
            name: 'Full Body',
            description: '3 days - Efficient total body workouts',
            daysPerWeek: 3,
            icon: '🏃'
        }
    ];

    selectedSplit = signal<string>('ppl');
    fitnessLevel = signal<string>('intermediate');
    isGenerating = signal(false);
    generatedPlan = signal<any>(null);
    isSaving = signal(false);

    constructor(private workoutService: WorkoutService) {}

    selectSplit(splitId: string) {
        this.selectedSplit.set(splitId);
    }

    generatePlan() {
        this.isGenerating.set(true);
        
        const planParams = {
            splitType: this.selectedSplit(),
            fitnessLevel: this.fitnessLevel()
        };

        this.workoutService.generateWorkoutPlan(planParams).subscribe({
            next: (plan) => {
                this.generatedPlan.set(plan);
                this.isGenerating.set(false);
            },
            error: () => {
                this.isGenerating.set(false);
                alert('Failed to generate plan. Please try again.');
            }
        });
    }

    savePlan() {
        const plan = this.generatedPlan();
        if (!plan) return;

        plan.isActive = true;
        this.isSaving.set(true);

        this.workoutService.saveWorkoutPlan(plan).subscribe({
            next: () => {
                this.isSaving.set(false);
                alert('Workout plan saved successfully!');
                this.resetGenerator(); // Reset form after saving
                this.planGenerated.emit();
            },
            error: () => {
                this.isSaving.set(false);
                alert('Failed to save plan. Please try again.');
            }
        });
    }

    resetGenerator() {
        this.generatedPlan.set(null);
        // Optionally reset selections
        // this.selectedSplit.set('ppl');
        // this.fitnessLevel.set('intermediate');
    }

    getDayName(dayOfWeek: number): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayOfWeek];
    }
}
