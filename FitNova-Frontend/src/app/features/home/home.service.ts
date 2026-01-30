import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserData {
    name: string;
    goal: string;
}

export interface TodaySummary {
    caloriesConsumed: number;
    caloriesBurned: number;
    waterIntake: number;
    workoutCompleted: boolean;
}

export interface GoalStatus {
    dailyTarget: number;
    consumed: number;
    burned: number;
    remaining: number;
    status: 'deficit' | 'surplus' | 'balanced';
}

export interface BMIData {
    value: number;
    category: string;
    color: string;
}

export interface DashboardData {
    userData: UserData;
    todaySummary: TodaySummary;
    goalStatus: GoalStatus;
    weeklyWorkouts: number;
    streak: number;
}

export interface WorkoutHistoryResponse {
    workouts: any[];
    analytics: {
        totalWorkouts: number;
        totalCaloriesBurned: number;
        bodyPartFrequency: Record<string, number>;
        periodDays: number;
    };
}

export interface MealHistoryData {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

export interface CalorieChartData {
    dates: string[];
    consumed: number[];
    burned: number[];
}


@Injectable({
    providedIn: 'root'
})
export class HomeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/tracker`;
    
    isLoading = signal(false);

    private motivationalQuotes = [
        "The only bad workout is the one that didn't happen.",
        "Your body can stand almost anything. It's your mind you have to convince.",
        "Success is the sum of small efforts repeated day in and day out.",
        "Don't wish for it. Work for it.",
        "The pain you feel today will be the strength you feel tomorrow."
    ];

    getDashboardData(): Observable<DashboardData> {
        this.isLoading.set(true);
        return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
            map(stats => {
                const user = this.getUserFromStorage();
                const today = stats.today;
                
                const consumed = today.caloriesConsumed || 0;
                const burned = today.caloriesBurned || 0;
                const net = consumed - burned;
                const remaining = (user?.dailyCalorieTarget || 2000) - net;
                
                let status: 'deficit' | 'surplus' | 'balanced';
                if (remaining > 100) status = 'deficit';
                else if (remaining < -100) status = 'surplus';
                else status = 'balanced';

                this.isLoading.set(false);
                
                return {
                    userData: {
                        name: user?.name || 'User',
                        goal: user?.goal === 'loss' ? 'Weight Loss' : user?.goal === 'gain' ? 'Weight Gain' : 'Maintain'
                    },
                    todaySummary: {
                        caloriesConsumed: consumed,
                        caloriesBurned: burned,
                        waterIntake: today.waterIntake || 0,
                        workoutCompleted: burned > 0
                    },
                    goalStatus: {
                        dailyTarget: user?.dailyCalorieTarget || 2000,
                        consumed,
                        burned,
                        remaining,
                        status
                    },
                    weeklyWorkouts: stats.weeklyWorkouts || 0,
                    streak: stats.streak || 0
                };
            }),
            catchError(() => {
                this.isLoading.set(false);
                const user = this.getUserFromStorage();
                return of({
                    userData: {
                        name: user?.name || 'User',
                        goal: user?.goal === 'loss' ? 'Weight Loss' : user?.goal === 'gain' ? 'Weight Gain' : 'Maintain'
                    },
                    todaySummary: {
                        caloriesConsumed: 0,
                        caloriesBurned: 0,
                        waterIntake: 0,
                        workoutCompleted: false
                    },
                    goalStatus: {
                        dailyTarget: user?.dailyCalorieTarget || 2000,
                        consumed: 0,
                        burned: 0,
                        remaining: user?.dailyCalorieTarget || 2000,
                        status: 'deficit' as const
                    },
                    weeklyWorkouts: 0,
                    streak: 0
                });
            })
        );
    }

    getUserData(): Observable<UserData> {
        const user = this.getUserFromStorage();
        return of({
            name: user?.name || 'User',
            goal: user?.goal === 'loss' ? 'Weight Loss' : user?.goal === 'gain' ? 'Weight Gain' : 'Maintain'
        });
    }

    getMotivationalQuote(): string {
        const randomIndex = Math.floor(Math.random() * this.motivationalQuotes.length);
        return this.motivationalQuotes[randomIndex];
    }

    getWorkoutHistory(days: number = 30): Observable<WorkoutHistoryResponse> {
        return this.http.get<WorkoutHistoryResponse>(`${environment.apiUrl}/workout/history?days=${days}`);
    }

    getCalorieChartData(days: number = 30): Observable<CalorieChartData> {
        return this.http.get<any>(`${environment.apiUrl}/tracker/history?days=${days}`).pipe(
            map((trackers: any[]) => {
                const dates: string[] = [];
                const consumed: number[] = [];
                const burned: number[] = [];

                // Sort by date ascending
                trackers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                trackers.forEach(tracker => {
                    dates.push(this.formatDate(tracker.date));
                    consumed.push(tracker.caloriesConsumed || 0);
                    burned.push(tracker.caloriesBurned || 0);
                });

                return { dates, consumed, burned };
            })
        );
    }

    private formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    private getUserFromStorage() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}
