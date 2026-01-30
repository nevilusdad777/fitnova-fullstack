import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tracker } from '../../core/models/tracker.model';

export interface BMIDatum {
	date: string;
	value: number;
}

export interface BMITrend {
	current: number;
	category: string;
	color: string;
	history: BMIDatum[];
}

export interface DashboardStats {
	today: Tracker;
	weeklyWorkouts: number;
	streak: number;
	totalWorkoutsCompleted: number;
}

@Injectable({
	providedIn: 'root'
})
export class TrackerService {
	private http = inject(HttpClient);
	private apiUrl = `${environment.apiUrl}/tracker`;
	
	isLoading = signal(false);
	private todayTracker = signal<Tracker | null>(null);

	getTodayTracker(): Observable<Tracker> {
		this.isLoading.set(true);
		return this.http.get<Tracker>(`${this.apiUrl}/today`).pipe(
			tap(tracker => {
				this.todayTracker.set(tracker);
				this.isLoading.set(false);
			})
		);
	}

	getDashboardStats(): Observable<DashboardStats> {
		this.isLoading.set(true);
		return this.http.get<DashboardStats>(`${this.apiUrl}/stats`).pipe(
			tap(() => this.isLoading.set(false))
		);
	}

	getTrackerHistory(days: number = 7): Observable<Tracker[]> {
		this.isLoading.set(true);
		return this.http.get<Tracker[]>(`${this.apiUrl}/history?days=${days}`).pipe(
			tap(() => this.isLoading.set(false))
		);
	}

	logWater(amount: number): Observable<Tracker> {
		return this.http.post<Tracker>(`${this.apiUrl}/water`, { amount }).pipe(
			tap(tracker => this.todayTracker.set(tracker))
		);
	}

	logWeight(weight: number): Observable<Tracker> {
		return this.http.post<Tracker>(`${this.apiUrl}/weight`, { weight }).pipe(
			tap(tracker => this.todayTracker.set(tracker))
		);
	}

	getBMITrend(): Observable<BMITrend> {
		// Calculate BMI from tracker history
		return this.getTrackerHistory(30).pipe(
			map(trackers => {
				// Get user info for height calculation
				const storedUser = localStorage.getItem('user');
				if (storedUser && trackers.length > 0) {
					const user = JSON.parse(storedUser);
					const height = user.height / 100; // Convert cm to m
					const latestTracker = trackers[trackers.length - 1];
					const currentBMI = latestTracker.weight / (height * height);
					
					// Map BMI to category
					let category = 'Normal';
					let color = '#10b981';
					if (currentBMI < 18.5) {
						category = 'Underweight';
						color = '#3b82f6';
					} else if (currentBMI >= 25 && currentBMI < 30) {
						category = 'Overweight';
						color = '#f59e0b';
					} else if (currentBMI >= 30) {
						category = 'Obese';
						color = '#ef4444';
					}

					// Map history to BMI data
					const history: BMIDatum[] = trackers.map(t => ({
						date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
						value: parseFloat((t.weight / (height * height)).toFixed(1))
					}));

					return {
						current: parseFloat(currentBMI.toFixed(1)),
						category,
						color,
						history
					};
				}
				
				// Return default if no data
				return {
					current: 0,
					category: 'Unknown',
					color: '#6b7280',
					history: []
				};
			})
		);
	}
}
