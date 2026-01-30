import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from '../../workout/workout.service';
import { LucideAngularModule, Dumbbell, Flame } from 'lucide-angular';

interface CalendarDay {
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    hasWorkout: boolean;
    workoutCount: number;
    totalCalories: number;
}

@Component({
    selector: 'app-monthly-workout-calendar',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <div class="calendar-container">
            <div class="calendar-header">
                <button class="nav-btn" (click)="previousMonth()" title="Previous month">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <div class="header-content">
                    <h3>{{ currentMonthName() }}</h3>
                    <span class="workout-count">{{ monthlyWorkoutCount() }} sessions</span>
                </div>
                <button class="nav-btn" (click)="nextMonth()" [disabled]="isCurrentMonth()" title="Next month">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>

            <div class="calendar-grid">
                <div class="day-label" *ngFor="let day of dayLabels">{{ day }}</div>
                
                <div 
                    *ngFor="let calDay of calendarDays()" 
                    class="calendar-day"
                    [class.has-workout]="calDay.hasWorkout"
                    [class.other-month]="!calDay.isCurrentMonth"
                    [class.today]="isToday(calDay.date)"
                    [title]="getTooltip(calDay)">
                    <span class="day-number">{{ calDay.day }}</span>
                    <lucide-icon 
                        *ngIf="calDay.hasWorkout" 
                        [img]="Dumbbell" 
                        [size]="12" 
                        class="workout-icon">
                    </lucide-icon>
                </div>
            </div>

            <div class="calendar-footer" *ngIf="monthlyCalories() > 0">
                <lucide-icon [img]="Flame" [size]="14"></lucide-icon>
                <span>{{ monthlyCalories() }} kcal</span>
            </div>
        </div>
    `,
    styles: [`
        .calendar-container {
            background: var(--card-bg);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            max-width: 600px;
            margin: 0 auto;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            gap: 0.5rem;
        }

        .header-content {
            flex: 1;
            text-align: center;
        }

        .calendar-header h3 {
            font-size: 1rem;
            font-weight: 700;
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0 0 0.25rem 0;
        }

        .nav-btn {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-primary);
            transition: all 0.2s;
        }

        .nav-btn:hover:not(:disabled) {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
        }

        .nav-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .workout-count {
            background: rgba(249, 115, 22, 0.1);
            color: var(--color-primary);
            padding: 0.25rem 0.6rem;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 0.3rem;
        }

        .day-label {
            text-align: center;
            font-size: 0.65rem;
            font-weight: 600;
            color: var(--text-secondary);
            padding: 0.4rem 0;
            text-transform: uppercase;
        }

        .calendar-day {
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.15rem;
            background: var(--bg-secondary);
            border: 1px solid transparent;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            min-height: 45px;
        }

        .calendar-day.other-month {
            opacity: 0.3;
        }

        .calendar-day.today {
            border-color: var(--color-primary);
            background: rgba(249, 115, 22, 0.05);
        }

        .calendar-day.has-workout {
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(220, 38, 38, 0.15));
            border-color: rgba(249, 115, 22, 0.3);
        }

        .calendar-day.has-workout:hover {
            transform: scale(1.05);
            border-color: var(--color-primary);
            box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
        }

        .day-number {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .workout-icon {
            color: var(--color-primary);
        }

        .calendar-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid var(--border-color);
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .calendar-footer lucide-icon {
            color: var(--color-primary);
        }

        @media (max-width: 768px) {
            .calendar-container {
                padding: 0.75rem;
            }

            .calendar-grid {
                gap: 0.2rem;
            }

            .day-number {
                font-size: 0.7rem;
            }

            .calendar-day {
                min-height: 40px;
            }

            .workout-icon {
                display: none;
            }
        }
    `]
})
export class MonthlyWorkoutCalendarComponent implements OnInit {
    private workoutService = inject(WorkoutService);

    readonly Dumbbell = Dumbbell;
    readonly Flame = Flame;

    dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    workouts = signal<any[]>([]);
    currentDate = signal(new Date());
    
    calendarDays = computed(() => this.generateCalendarDays());
    currentMonthName = computed(() => {
        const date = this.currentDate();
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    });

    monthlyWorkoutCount = computed(() => {
        return this.calendarDays().filter(d => d.hasWorkout && d.isCurrentMonth).length;
    });

    monthlyCalories = computed(() => {
        return this.calendarDays()
            .filter(d => d.hasWorkout && d.isCurrentMonth)
            .reduce((sum, d) => sum + d.totalCalories, 0);
    });

    ngOnInit() {
        this.loadMonthlyWorkouts();
    }

    private loadMonthlyWorkouts() {
        const currentDate = this.currentDate();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const filters = {
            startDate: firstDay.toISOString().split('T')[0],
            endDate: lastDay.toISOString().split('T')[0]
        };

        this.workoutService.getWorkoutHistory(filters).subscribe({
            next: (response: any) => {
                this.workouts.set(response.data || []);
            },
            error: (err: any) => {
                console.error('Error loading monthly workouts:', err);
                this.workouts.set([]);
            }
        });
    }

    private generateCalendarDays(): CalendarDay[] {
        const date = this.currentDate();
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days: CalendarDay[] = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayDate = new Date(year, month - 1, prevMonthLastDay - i);
            days.push(this.createCalendarDay(dayDate, false));
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            days.push(this.createCalendarDay(dayDate, true));
        }

        // Next month days to fill the grid
        const remainingDays = 7 - (days.length % 7);
        if (remainingDays < 7) {
            for (let i = 1; i <= remainingDays; i++) {
                const dayDate = new Date(year, month + 1, i);
                days.push(this.createCalendarDay(dayDate, false));
            }
        }

        return days;
    }

    private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
        const workoutsOnDay = this.workouts().filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate.toDateString() === date.toDateString();
        });

        return {
            date,
            day: date.getDate(),
            isCurrentMonth,
            hasWorkout: workoutsOnDay.length > 0,
            workoutCount: workoutsOnDay.length,
            totalCalories: workoutsOnDay.reduce((sum, w) => sum + (w.totalCaloriesBurned || 0), 0)
        };
    }

    isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getTooltip(calDay: CalendarDay): string {
        if (!calDay.hasWorkout) return '';
        return `${calDay.workoutCount} workout(s) - ${calDay.totalCalories} kcal`;
    }

    previousMonth(): void {
        const current = this.currentDate();
        const newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
        this.currentDate.set(newDate);
        this.loadMonthlyWorkouts();
    }

    nextMonth(): void {
        const current = this.currentDate();
        const newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        this.currentDate.set(newDate);
        this.loadMonthlyWorkouts();
    }

    isCurrentMonth(): boolean {
        const current = this.currentDate();
        const now = new Date();
        return current.getMonth() === now.getMonth() && 
               current.getFullYear() === now.getFullYear();
    }
}
