import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  _id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: string;
  activityLevel: number;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

export interface UserStats {
  totalUsers: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  goalDistribution: {
    [key: string]: number;
  };
  recentUsers: User[];
}

export interface AdminUserRoutine {
  _id: string;
  name: string;
  difficulty: string;
  target: string;
  daysOfWeek: number[];
  createdAt: string;
}

export interface AdminUserWorkout {
  _id: string;
  routine?: { name: string };
  date: string;
  duration: number;
  totalVolume: number;
  totalCaloriesBurned?: number;
  exercises: any[];
}

export interface AdminUserDiet {
  _id: string;
  date: string;
  totalCalories: number;
  calorieTarget: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 1, limit: number = 10, search: string = '', goal: string = '', gender: string = ''): Observable<UserListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (goal) params = params.set('goal', goal);
    if (gender) params = params.set('gender', gender);

    return this.http.get<UserListResponse>(`${this.apiUrl}/admin/users`, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/admin/users/${id}`);
  }

  updateUser(id: string, userData: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${id}`);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/admin/users/stats/overview`);
  }

  getUserRoutines(id: string): Observable<AdminUserRoutine[]> {
    return this.http.get<AdminUserRoutine[]>(`${this.apiUrl}/admin/users/${id}/routines`);
  }

  getUserWorkoutHistory(id: string, days?: number): Observable<AdminUserWorkout[]> {
    let params = new HttpParams();
    if (days) params = params.set('days', days.toString());
    return this.http.get<AdminUserWorkout[]>(`${this.apiUrl}/admin/users/${id}/workouts`, { params });
  }

  getUserDiet(id: string, days?: number): Observable<AdminUserDiet[]> {
    let params = new HttpParams();
    if (days) params = params.set('days', days.toString());
    return this.http.get<AdminUserDiet[]>(`${this.apiUrl}/admin/users/${id}/diet`, { params });
  }

  deleteUserWorkout(userId: string, workoutId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}/workouts/${workoutId}`);
  }

  deleteUserDiet(userId: string, date: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}/diet/${date}`);
  }
}
