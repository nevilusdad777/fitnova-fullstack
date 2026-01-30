import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, Dumbbell, Flame, TrendingUp, Filter, RefreshCw } from 'lucide-angular';
import { WorkoutService } from '../../workout.service';
import { WorkoutHistory } from '../../../../core/models/workout.model';

@Component({
    selector: 'app-workout-history',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './workout-history.component.html',
    styleUrls: ['./workout-history.component.css']
})
export class WorkoutHistoryComponent implements OnInit {
    readonly Calendar = Calendar;
    readonly Dumbbell = Dumbbell;
    readonly Flame = Flame;
    readonly TrendingUp = TrendingUp;
    readonly Filter = Filter;
    readonly RefreshCw = RefreshCw;

    workoutHistory = signal<WorkoutHistory[]>([]);
    stats = signal<any>(null);
    isLoading = signal(false);
    selectedDays = signal(0); // 0 means 'All'

    dayOptions = [{ value: 0, label: 'All' }, { value: 7, label: '7 days' }, { value: 30, label: '30 days' }, { value: 90, label: '90 days' }];

    constructor(
        private workoutService: WorkoutService
    ) {}

    ngOnInit() {
        this.loadHistory();
        this.loadStats();
    }

    loadHistory() {
        this.isLoading.set(true);
        const filters: any = {};
        
        // If not 'All', set the date range
        if (this.selectedDays() > 0) {
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // Set to end of today
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - this.selectedDays());
            startDate.setHours(0, 0, 0, 0); // Set to start of day
            
            filters.startDate = startDate.toISOString();
            filters.endDate = endDate.toISOString();
            console.log('Date filters:', filters);
        }
        
        this.workoutService.getWorkoutHistory(filters).subscribe({
            next: (response) => {
                console.log('Workout history response:', response);
                const workouts = response.data || [];
                this.workoutHistory.set(workouts);
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Error loading history:', error);
                this.workoutHistory.set([]);
                this.isLoading.set(false);
            }
        });
    }

    extractBodyParts(workout: any): string[] {
        const bodyParts = new Set<string>();
        const name = (workout.name || '').toLowerCase();
        if (name.includes('chest')) bodyParts.add('chest');
        if (name.includes('back')) bodyParts.add('back');
        if (name.includes('leg')) bodyParts.add('legs');
        if (name.includes('shoulder')) bodyParts.add('shoulders');
        if (name.includes('arm')) bodyParts.add('arms');
        if (name.includes('abs') || name.includes('core')) bodyParts.add('abs');
        if (name.includes('cardio')) bodyParts.add('cardio');
        return Array.from(bodyParts);
    }

    loadStats() {
        const days = this.selectedDays() > 0 ? this.selectedDays() : 365; // For 'All', use 1 year
        this.workoutService.getWorkoutStats(days).subscribe({
            next: (response) => {
                console.log('Workout stats response:', response);
                const data = response.data || {};
                
                this.stats.set({
                    totalWorkouts: data.totalWorkouts || 0,
                    totalCalories: data.totalCalories || 0,
                    totalDuration: data.totalDuration || 0,
                    avgCaloriesPerWorkout: data.avgCaloriesPerWorkout || 0
                });
            },
            error: (error) => {
                console.error('Error loading stats:', error);
                this.stats.set({
                    totalWorkouts: 0,
                    totalCalories: 0,
                    totalDuration: 0,
                    avgCaloriesPerWorkout: 0
                });
            }
        });
    }

    changePeriod(days: number) {
        this.selectedDays.set(days);
        this.loadHistory();
        this.loadStats();
    }

    refresh() {
        this.loadHistory();
        this.loadStats();
    }

    formatDate(date: any): string {
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    formatDuration(minutes: number): string {
        if (!minutes) return '0m';
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
}
