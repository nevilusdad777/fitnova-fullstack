import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Tracker } from '../core/models/tracker.model';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/tracker';
  
  todayTracker = signal<Tracker | null>(null);

  getTodayTracker(): Observable<Tracker> {
    return this.http.get<Tracker>(`${this.apiUrl}/today`).pipe(
      tap(tracker => this.todayTracker.set(tracker))
    );
  }

  updateWaterIntake(amount: number): Observable<Tracker> {
    return this.http.post<Tracker>(`${this.apiUrl}/water`, { amount }).pipe(
      tap(tracker => this.todayTracker.set(tracker))
    );
  }

  updateWeight(weight: number): Observable<Tracker> {
    return this.http.post<Tracker>(`${this.apiUrl}/weight`, { weight }).pipe(
      tap(tracker => this.todayTracker.set(tracker))
    );
  }

  getHistory(days: number = 7): Observable<Tracker[]> {
    return this.http.get<Tracker[]>(`${this.apiUrl}/history?days=${days}`);
  }

  getDashboardStats(): Observable<{ today: Tracker, weeklyWorkouts: number, streak: number }> {
    return this.http.get<{ today: Tracker, weeklyWorkouts: number, streak: number }>(`${this.apiUrl}/stats`);
  }
}
