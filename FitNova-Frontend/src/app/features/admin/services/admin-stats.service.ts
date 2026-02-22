import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalFoods: number;
    totalExercises: number;
    totalWorkoutPlans: number;
    totalDietPlans: number;
    recentUsers: number;
  };
  userStats: {
    goalDistribution: { [key: string]: number };
    genderDistribution: { [key: string]: number };
  };
  recentActivity: {
    registrations: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/admin/stats/dashboard`);
  }

  getUserGrowth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats/users/growth`);
  }
}
