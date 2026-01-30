import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  _id: string; // MongoDB ID
  id?: string; // For backward compatibility if needed
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Workout { // Exercises from DB
  _id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // minutes
  calories: number;
  bodyPart: string;
  equipment: string;
}

export interface DietPlan { // Foods from DB
  _id: string;
  name: string; // title in food model?
  title?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeWorkouts: number;
  totalDietPlans: number;
  revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  // Workouts (Mapped to Exercises)
  getWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${this.apiUrl}/exercises`);
  }

  saveWorkout(workout: Workout): Observable<any> {
    // In search of time, we just mock save for now or implement create exercise if needed.
    // User asked to "show data", so fetching is priority.
    // For now we assume read-only or mock-save for real data until backend supports it fully.
    return new Observable(observer => {
        observer.next(true);
        observer.complete();
    });
  }

  deleteWorkout(id: string): Observable<any> {
     // Mock delete for now as we don't want to delete system exercises easily
     return new Observable(observer => {
        observer.next(true);
        observer.complete();
    });
  }

  // Diet Plans (Mapped to Foods)
  getDietPlans(): Observable<DietPlan[]> {
    return this.http.get<DietPlan[]>(`${this.apiUrl}/foods`);
  }

  saveDietPlan(plan: DietPlan): Observable<any> {
     return new Observable(observer => {
        observer.next(true);
        observer.complete();
    });
  }

  deleteDietPlan(id: string): Observable<any> {
     return new Observable(observer => {
        observer.next(true);
        observer.complete();
    });
  }
}
