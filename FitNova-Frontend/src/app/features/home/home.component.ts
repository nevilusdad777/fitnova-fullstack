import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Activity, Utensils, Droplets, TrendingUp, ArrowRight, Flame, Calendar, Award, Target, Clock, Zap } from 'lucide-angular';
import { AuthService } from '../auth/auth.service';
import { TrackerService } from '../../services/tracker.service';
import { HomeService } from './home.service';
import { MonthlyWorkoutCalendarComponent } from './components/monthly-workout-calendar.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, MonthlyWorkoutCalendarComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    readonly Activity = Activity;
    readonly Utensils = Utensils;
    readonly Droplets = Droplets;
    readonly TrendingUp = TrendingUp;
    readonly ArrowRight = ArrowRight;
    readonly Flame = Flame;
    readonly Calendar = Calendar;
    readonly Award = Award;
    readonly Target = Target;
    readonly Clock = Clock;
    readonly Zap = Zap;

    private authService = inject(AuthService);
    private trackerService = inject(TrackerService);
    private homeService = inject(HomeService);
    
    userName = computed(() => this.authService.currentUser()?.name?.split(' ')[0] || 'User');
    userInitials = computed(() => {
        const name = this.authService.currentUser()?.name;
        return name ? name.split(' ').map((n: string) => n[0]).join('') : 'U';
    });
    profilePicture = computed(() => this.authService.currentUser()?.profilePicture);

    stats = signal([
        { label: 'Workouts', value: '0', unit: 'sessions', icon: Activity, color: 'var(--color-workout)' },
        { label: 'Calories', value: '0', unit: 'kcal', icon: Utensils, color: 'var(--color-calorie)' },
        { label: 'Water', value: '0', unit: 'L', icon: Droplets, color: 'var(--color-water)' },
        { label: 'Weight', value: '0', unit: 'kg', icon: TrendingUp, color: 'var(--color-primary)' }
    ]);

    // Workout summary stats
    totalWorkouts = signal(0);
    totalCaloriesBurned = signal(0);

    // New enhancement signals
    recentWorkouts = signal<any[]>([]);
    weeklyActivity = signal<boolean[]>([false, false, false, false, false, false, false]);
    activeWorkoutDays = computed(() => this.weeklyActivity().filter(day => day).length);
    fitnessPersona = signal<{title: string, subtitle: string, icon: any, description: string, color: string, gradient: string, level: number, progress: number} | null>(null);
    currentStreak = signal(0);
    bestStreak = signal(0);
    motivationalQuote = signal('');

    ngOnInit() {
        this.trackerService.getDashboardStats().subscribe({
            next: (stats) => {
                console.log('Dashboard stats received:', stats);
                this.stats.set([
                    { label: 'Calories Burned', value: Math.round(stats.today.caloriesBurned || 0).toString(), unit: 'kcal', icon: Flame, color: 'var(--color-primary)' },
                    { label: 'Calories Intake', value: Math.round(stats.today.caloriesConsumed || 0).toString(), unit: 'kcal', icon: Utensils, color: 'var(--color-calorie)' },
                    { label: 'Water', value: (stats.today.waterIntake || 0).toFixed(1), unit: 'L', icon: Droplets, color: 'var(--color-water)' },
                    { label: 'Weight', value: (stats.today.weight || 0).toFixed(1), unit: 'kg', icon: TrendingUp, color: 'var(--color-primary)' }
                ]);
                // Set streak data
                this.currentStreak.set(stats.streak || 0);
                this.bestStreak.set(stats.streak || 0); // Can be enhanced with actual best streak from backend
            },
            error: (err) => {
                console.error('Error loading dashboard stats:', err);
            }
        });

        // Load workout summary - show ALL workouts, not just this month
        this.homeService.getWorkoutHistory(365).subscribe({  // Get last year of workouts
            next: (response) => {
                console.log('Workout history response:', response);
                console.log('Analytics:', response.analytics);
                console.log('Workouts array:', response.workouts);
                
                // Show ALL workouts (don't filter by month)
                const allWorkouts = response.workouts || [];
                
                this.totalWorkouts.set(allWorkouts.length);
                this.totalCaloriesBurned.set(Math.round(
                    allWorkouts.reduce((sum: number, w: any) => sum + (w.totalCaloriesBurned || 0), 0)
                ));
                
                // Get recent 5 workouts
                const recent = allWorkouts.slice(0, 5).map((workout: any) => ({
                    date: new Date(workout.date || workout.createdAt),  // Use date field, fallback to createdAt
                    duration: workout.duration || 30,
                    calories: Math.round(workout.totalCaloriesBurned),
                    bodyParts: workout.bodyParts || [],
                    exercises: workout.exercises?.length || 0
                }));
                console.log('Recent workouts processed:', recent);
                this.recentWorkouts.set(recent);
                
                // Calculate weekly activity (last 7 days)
                const today = new Date();
                const weekActivity = Array(7).fill(false);
                for (let i = 0; i < 7; i++) {
                    const dayDate = new Date(today);
                    dayDate.setDate(today.getDate() - (6 - i));
                    const hasWorkout = allWorkouts.some((w: any) => {
                        const workoutDate = new Date(w.date || w.createdAt);  // Use date field
                        return workoutDate.toDateString() === dayDate.toDateString();
                    });
                    weekActivity[i] = hasWorkout;
                }
                console.log('Weekly activity:', weekActivity);
                this.weeklyActivity.set(weekActivity);
                
                // Calculate Fitness Persona & Level
                const bodyPartFreq = response.analytics.bodyPartFrequency || {};
                const totalExercises = Object.values(bodyPartFreq).reduce((a: number, b: any) => a + b, 0);
                
                // Level Calculation (Simple RPG style: Level = sqrt(workouts) * 2 or similar)
                // Let's make it a bit harder: Level 1 = 0-10, Level 5 = ~100
                const xpPerWorkout = 50;
                const totalXP = this.totalWorkouts() * xpPerWorkout;
                const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
                const nextLevelXP = Math.pow(level, 2) * 100;
                const currentLevelBaseXP = Math.pow(level - 1, 2) * 100;
                const progressToNext = Math.min(100, Math.max(0, ((totalXP - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100));

                let persona = {
                    title: 'Rookie',
                    subtitle: 'The Beginning',
                    icon: this.Target, 
                    description: 'Every legend starts somewhere. Keep pushing!',
                    color: 'var(--color-text-muted)',
                    gradient: 'linear-gradient(135deg, #e0e0e0, #9e9e9e)',
                    level: level,
                    progress: Math.round(progressToNext)
                };

                if (this.totalWorkouts() > 5) {
                    const cardio = (bodyPartFreq['cardio'] || 0) + (bodyPartFreq['legs'] || 0) * 0.3; 
                    const strength = (bodyPartFreq['chest'] || 0) + (bodyPartFreq['back'] || 0) + (bodyPartFreq['shoulders'] || 0) + (bodyPartFreq['arms'] || 0);
                    const legs = bodyPartFreq['legs'] || 0;
                    
                    if (cardio > strength * 1.5) {
                         persona = {
                            title: 'Cardio Crusher',
                            subtitle: 'Endurance Master',
                            icon: this.Zap,
                            description: 'You were born to run! Your stamina is legendary.',
                            color: 'var(--color-water)',
                            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            level: level,
                            progress: Math.round(progressToNext)
                        };
                    } else if (legs > strength * 0.4) { 
                        persona = {
                            title: 'Leg Day Legend',
                            subtitle: 'Lower Body Specialist',
                            icon: this.TrendingUp,
                            description: 'They said don\'t skip leg day. You live for it.',
                            color: 'var(--color-primary)',
                            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            level: level,
                            progress: Math.round(progressToNext)
                        };
                    } else if (strength > cardio * 2) {
                        persona = {
                            title: 'Iron Titan',
                            subtitle: 'Strength Specialist',
                            icon: this.Flame,
                            description: 'Forged in iron. Your strength knows no bounds.',
                            color: 'var(--color-calorie)', 
                            gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #feada6 100%)', // Or better: Fire gradient
                            level: level,
                            progress: Math.round(progressToNext)
                        };
                        // Override gradient for Iron Titan to be more fiery
                        persona.gradient = 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)';
                    } else {
                        persona = {
                            title: 'Balanced Athlete',
                            subtitle: 'Hybrid Specialist',
                            icon: this.Award,
                            description: 'Perfectly balanced physical prowess. Ready for anything.',
                            color: 'var(--color-workout)', 
                            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            level: level,
                            progress: Math.round(progressToNext)
                        };
                    }
                }
                
                this.fitnessPersona.set(persona);
            },
            error: (err) => {
                console.error('Error loading workout summary:', err);
                console.error('Error details:', err.error);
            }
        });

        // Set motivational quote
        this.motivationalQuote.set(this.homeService.getMotivationalQuote());
    }

    formatBodyPart(bodyPart: string): string {
        return bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1).toLowerCase();
    }

    formatDate(date: Date): string {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    getDayName(index: number): string {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const dayIndex = new Date(today.setDate(today.getDate() - (6 - index))).getDay();
        return days[dayIndex];
    }
}
