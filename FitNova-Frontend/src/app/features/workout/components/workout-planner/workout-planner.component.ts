import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Trash2, Check } from 'lucide-angular';
import { WorkoutService } from '../../workout.service';
import { WeekDay, PlannedWorkout } from '../../../../core/models/workout.model';

@Component({
    selector: 'app-workout-planner',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './workout-planner.component.html',
    styleUrls: ['./workout-planner.component.css']
})
export class WorkoutPlannerComponent {
    readonly Plus = Plus;
    readonly Trash2 = Trash2;
    readonly Check = Check;

    weekDays = signal<WeekDay[]>([]);
    selectedDay = signal<WeekDay | null>(null);
    availableCategories = signal<string[]>([]);

    constructor(private workoutService: WorkoutService) {
        this.loadWeeklyPlan();
        this.availableCategories.set(this.workoutService.getWorkoutCategories().map(c => c.name));
    }

    loadWeeklyPlan() {
        this.workoutService.getWeeklyPlan().subscribe(workouts => {
            const initialPlan = this.workoutService.getInitialWeekPlan();
            // Map backend workouts to UI week days
            workouts.forEach(w => {
                const date = new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const day = initialPlan.find(d => d.date === date);
                if (day) {
                    day.workouts.push({
                        id: w._id || '',
                        category: w.name || 'Workout',
                        completed: w.completed || false
                    });
                }
            });
            this.weekDays.set(initialPlan);
        });
    }

    selectDay(day: WeekDay) {
        this.selectedDay.set(day);
    }

    addWorkout(day: WeekDay, category: string) {
        const workoutData = {
            name: category,
            date: new Date(day.date + ', ' + new Date().getFullYear()).toISOString(),
            exercises: [],
            completed: false
        };
        this.workoutService.createWorkout(workoutData).subscribe(() => {
            this.loadWeeklyPlan();
        });
    }

    removeWorkout(day: WeekDay, workoutId: string) {
        // Implement delete in service if missing
        this.loadWeeklyPlan();
    }

    toggleRestDay(day: WeekDay) {
        // Implement rest day in backend if needed
        this.loadWeeklyPlan();
    }

    markCompleted(day: WeekDay, workoutId: string) {
        this.workoutService.updateWorkout(workoutId, { completed: true }).subscribe(() => {
            this.loadWeeklyPlan();
        });
    }

    getCategoryEmoji(category: string): string {
        const emojiMap: { [key: string]: string } = {
            'Chest': '💪',
            'Back': '🦾',
            'Legs': '🦵',
            'Shoulder': '🏋️',
            'Arms': '💪',
            'Abs': '🔥'
        };
        return emojiMap[category] || '💪';
    }
}