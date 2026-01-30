import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Workout, Exercise, WeekDay, PlannedWorkout, WorkoutRoutine, WorkoutHistory } from '../../core/models/workout.model';
import { environment } from '../../../environments/environment';

export type { Workout, Exercise, WeekDay, PlannedWorkout, WorkoutRoutine, WorkoutHistory };

export interface WorkoutCategory {
    name: string;
    description: string;
    color: string;
    emoji: string;
    exerciseCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class WorkoutService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/workout`;
    private exerciseUrl = `${environment.apiUrl}/exercises`;
    private routineUrl = `${environment.apiUrl}/routines`;
    private historyUrl = `${environment.apiUrl}/workout-history`;

    private activeWorkout = signal<Exercise[]>([]);
    private activeRoutine = signal<WorkoutRoutine | null>(null);
    isLoading = signal(false);
    
    private workoutCategories: WorkoutCategory[] = [
        { name: 'Chest', description: 'Build a powerful chest', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', emoji: '', exerciseCount: 8 },
        { name: 'Back', description: 'Strengthen your back muscles', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', emoji: '', exerciseCount: 7 },
        { name: 'Legs', description: 'Power up your lower body', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', emoji: '', exerciseCount: 9 },
        { name: 'Shoulders', description: 'Build boulder shoulders', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', emoji: '', exerciseCount: 7 },
        { name: 'Biceps', description: 'Build bigger peaks', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', emoji: '', exerciseCount: 5 },
        { name: 'Triceps', description: 'Tone and strengthen arms', color: 'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)', emoji: '', exerciseCount: 5 },
        { name: 'Abs', description: 'Core strength and definition', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', emoji: '', exerciseCount: 7 },
        { name: 'Cardio', description: 'Boost cardiovascular health', color: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', emoji: '', exerciseCount: 8 }
    ];

    getWorkoutCategories(): WorkoutCategory[] {
        return this.workoutCategories;
    }

    // Get all exercises
    getExercises(bodyPart?: string, difficulty?: string): Observable<any> {
        this.isLoading.set(true);
        let url = `${this.exerciseUrl}/all`;
        const params: any = {};
        
        if (bodyPart) {
            params.bodyPart = bodyPart.toLowerCase();
        }
        
        if (difficulty) {
            params.difficulty = difficulty;
        }

        return this.http.get<any>(url, { params }).pipe(
            tap(() => this.isLoading.set(false))
        );
    }

    // Get exercises by specific body part
    getExercisesByBodyPart(bodyPart: string): Observable<any> {
        this.isLoading.set(true);
        return this.http.get<any>(`${this.exerciseUrl}/body-part/${bodyPart.toLowerCase()}`).pipe(
            tap(() => this.isLoading.set(false))
        );
    }

    // Search exercises
    searchExercises(query: string): Observable<any> {
        this.isLoading.set(true);
        return this.http.get<any>(`${this.exerciseUrl}/search`, { params: { query } }).pipe(
            tap(() => this.isLoading.set(false))
        );
    }

    getWeeklyPlan(): Observable<Workout[]> {
        this.isLoading.set(true);
        return this.http.get<Workout[]>(`${this.apiUrl}/weekly`).pipe(
            tap(() => this.isLoading.set(false))
        );
    }

    getTodayWorkout(): Observable<Workout> {
        this.isLoading.set(true);
        return this.http.get<Workout>(`${this.apiUrl}/today`).pipe(
            tap(() => this.isLoading.set(false))
        );
    }

    createWorkout(workoutData: any): Observable<Workout> {
        return this.http.post<Workout>(`${this.apiUrl}/create`, workoutData);
    }

    updateWorkout(id: string, workoutData: any): Observable<Workout> {
        return this.http.put<Workout>(`${this.apiUrl}/${id}`, workoutData);
    }

    logWorkout(caloriesBurned: number, duration: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/log`, { caloriesBurned, duration });
    }

    setActiveWorkout(exercises: Exercise[]) {
        this.activeWorkout.set(exercises);
    }

    getActiveWorkout(): Exercise[] {
        return this.activeWorkout();
    }

    getInitialWeekPlan(): WeekDay[] {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const today = new Date().getDay();
        const currentDay = today === 0 ? 6 : today - 1;

        return days.map((day, index) => ({
            day,
            date: this.getDateForDay(index),
            workouts: [],
            isRestDay: false,
            isToday: index === currentDay
        }));
    }

    private getDateForDay(dayIndex: number): string {
        const today = new Date();
        const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1;
        const diff = dayIndex - currentDay;
        const date = new Date(today);
        date.setDate(today.getDate() + diff);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Workout Plan Generator APIs
    generateWorkoutPlan(params: { splitType: string, fitnessLevel: string }): Observable<any> {
        this.isLoading.set(true);
        return this.http.post(`${environment.apiUrl}/workout-plan/generate`, params).pipe(
            tap(() => this.isLoading.set(false))
        );
    }

    saveWorkoutPlan(planData: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/workout-plan`, planData);
    }

    getActiveWorkoutPlan(): Observable<any> {
        this.isLoading.set(true);
        return this.http.get(`${environment.apiUrl}/workout-plan/active`).pipe(
            tap(() => this.isLoading.set(false))
        );
    }

    updateWorkoutPlan(planId: string, planData: any): Observable<any> {
        return this.http.put(`${environment.apiUrl}/workout-plan/${planId}`, planData);
    }

    deleteWorkoutPlan(planId: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/workout-plan/${planId}`);
    }

    // Workout Routine APIs
    createRoutine(routineData: Partial<WorkoutRoutine>): Observable<any> {
        return this.http.post(`${this.routineUrl}`, routineData);
    }

    getRoutines(bodyPart?: string, isActive?: boolean): Observable<any> {
        const params: any = {};
        if (bodyPart) params.bodyPart = bodyPart;
        if (isActive !== undefined) params.isActive = isActive;
        
        return this.http.get(`${this.routineUrl}`, { params });
    }

    getRoutineById(id: string): Observable<any> {
        return this.http.get(`${this.routineUrl}/${id}`);
    }

    updateRoutine(id: string, routineData: Partial<WorkoutRoutine>): Observable<any> {
        return this.http.put(`${this.routineUrl}/${id}`, routineData);
    }

    deleteRoutine(id: string): Observable<any> {
        return this.http.delete(`${this.routineUrl}/${id}`);
    }

    toggleRoutineActive(id: string): Observable<any> {
        return this.http.patch(`${this.routineUrl}/${id}/toggle`, {});
    }

    setActiveRoutine(routine: WorkoutRoutine | null) {
        this.activeRoutine.set(routine);
    }

    getActiveRoutine(): WorkoutRoutine | null {
        return this.activeRoutine();
    }

    // Workout History APIs
    saveWorkoutSession(sessionData: Partial<WorkoutHistory>): Observable<any> {
        return this.http.post(`${this.historyUrl}`, sessionData);
    }

    getWorkoutHistory(filters?: {
        startDate?: string;
        endDate?: string;
        bodyPart?: string;
        routineId?: string;
        limit?: number;
        page?: number;
    }): Observable<any> {
        const params: any = {};
        if (filters) {
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (filters.bodyPart) params.bodyPart = filters.bodyPart;
            if (filters.routineId) params.routineId = filters.routineId;
            if (filters.limit) params.limit = filters.limit;
            if (filters.page) params.page = filters.page;
        }
        
        return this.http.get(`${this.historyUrl}`, { params });
    }

    getWorkoutStats(days: number = 30): Observable<any> {
        return this.http.get(`${this.historyUrl}/stats`, { params: { days: days.toString() } });
    }

    getRecentWorkouts(limit: number = 10): Observable<any> {
        return this.http.get(`${this.historyUrl}/recent`, { params: { limit: limit.toString() } });
    }

    deleteWorkoutHistory(id: string): Observable<any> {
        return this.http.delete(`${this.historyUrl}/${id}`);
    }
}
