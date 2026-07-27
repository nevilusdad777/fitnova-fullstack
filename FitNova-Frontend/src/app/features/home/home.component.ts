import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Activity, Utensils, Droplets, TrendingUp, ArrowRight, Flame, Calendar, Award, Target, Clock, Zap, Brain } from 'lucide-angular';
import { AuthService } from '../auth/auth.service';
import { TrackerService } from '../../services/tracker.service';
import { HomeService } from './home.service';
import { WorkoutService } from '../workout/workout.service';
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
    readonly Brain = Brain;

    private authService = inject(AuthService);
    private trackerService = inject(TrackerService);
    private homeService = inject(HomeService);
    private workoutService = inject(WorkoutService);
    
    userName = computed(() => this.authService.currentUser()?.name?.split(' ')[0] || 'User');
    userInitials = computed(() => {
        const name = this.authService.currentUser()?.name;
        return name ? name.split(' ').map((n: string) => n[0]).join('') : 'U';
    });
    profilePicture = computed(() => this.authService.currentUser()?.profilePicture);

    stats = signal([
        { label: 'Calories Burned', value: '0', unit: 'kcal', icon: Flame, color: 'var(--color-primary)', route: '/workout', queryParams: null, valueClass: 'stat-value-burned' },
        { label: 'Calories Intake', value: '0', unit: 'kcal', icon: Utensils, color: 'var(--color-calorie)', route: '/nutrition', queryParams: { view: 'meals' }, valueClass: 'stat-value-intake' },
        { label: 'Water', value: '0', unit: 'L', icon: Droplets, color: 'var(--color-water)', route: '/tracker', queryParams: { view: 'water' }, valueClass: 'stat-value-water' },
        { label: 'Weight', value: '0', unit: 'kg', icon: TrendingUp, color: 'var(--color-primary)', route: '/tracker', queryParams: { view: 'weight' }, valueClass: 'stat-value-weight' }
    ]);

    // Workout summary stats
    totalWorkouts = signal(0);
    totalCaloriesBurned = signal(0);

    // New enhancement signals
    recentWorkouts = signal<any[]>([]);
    weeklyActivity = signal<boolean[]>([false, false, false, false, false, false, false]);
    activeWorkoutDays = computed(() => this.weeklyActivity().filter(day => day).length);
    currentStreak = signal(0);
    bestStreak = signal(0);
    motivationalQuote = signal('');

    // Milestone computed properties
    private readonly MILESTONES = [7, 30, 90, 365];

    isMilestoneStreak = computed(() => this.MILESTONES.includes(this.currentStreak()));

    /** Progress % toward the next milestone */
    streakProgressPct = computed(() => {
        const s = this.currentStreak();
        if (s === 0) return 0;
        // If it's a milestone day, show 100% full (and gold via CSS)
        if (this.MILESTONES.includes(s)) return 100;

        if (s >= 365) return 100;
        if (s > 90) return Math.min(100, (s - 90) / (365 - 90) * 100);
        if (s > 30) return Math.min(100, (s - 30) / (90  - 30) * 100);
        if (s >  7) return Math.min(100, (s -  7) / (30  -  7) * 100);
        return (s / 7) * 100;
    });

    nextMilestoneDays = computed(() => {
        const s = this.currentStreak();
        for (const m of this.MILESTONES) { if (s < m) return m - s; }
        return 0; // past 365
    });

    milestoneTitle = computed(() => {
        const s = this.currentStreak();
        if (s >= 365) return 'Year Legend 👑';
        if (s >=  90) return '90-Day Champion 🚀';
        if (s >=  30) return 'Monthly Beast 💪';
        return 'Week Warrior 🏆';
    });

    ngOnInit() {
        this.trackerService.getDashboardStats().subscribe({
            next: (stats) => {
                console.log('Dashboard stats received:', stats);
                this.stats.set([
                    { label: 'Calories Burned', value: Math.round(stats.today.caloriesBurned || 0).toString(), unit: 'kcal', icon: Flame, color: 'var(--color-primary)', route: '/workout', queryParams: null, valueClass: 'stat-value-burned' },
                    { label: 'Calories Intake', value: Math.round(stats.today.caloriesConsumed || 0).toString(), unit: 'kcal', icon: Utensils, color: 'var(--color-calorie)', route: '/nutrition', queryParams: { view: 'meals' }, valueClass: 'stat-value-intake' },
                    { label: 'Water', value: (stats.today.waterIntake || 0).toFixed(1), unit: 'L', icon: Droplets, color: 'var(--color-water)', route: '/tracker', queryParams: { view: 'water' }, valueClass: 'stat-value-water' },
                    { label: 'Weight', value: (stats.today.weight || 0).toFixed(1), unit: 'kg', icon: TrendingUp, color: 'var(--color-primary)', route: '/tracker', queryParams: { view: 'weight' }, valueClass: 'stat-value-weight' }
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
