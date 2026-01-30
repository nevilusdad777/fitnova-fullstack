import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../core/models/user.model';
import { AuthService } from '../features/auth/auth.service';

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  unitPreference: 'Metric' | 'Imperial';
}

export interface FitnessGoals {
  fitnessGoal: 'Weight Loss' | 'Weight Gain' | 'Maintain';
  targetWeight: number;
  activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Very Active' | 'Extra Active';
}

export interface Calculations {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/user`;

  private userProfile = signal<User | null>(null);
  
  isLoading = signal(false);

  getProfile(): Observable<User> {
    this.isLoading.set(true);
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
        this.userProfile.set(user);
        this.isLoading.set(false);
      })
    );
  }

  updateProfile(data: Partial<User>): Observable<User> {
    this.isLoading.set(true);
    return this.http.put<User>(`${this.apiUrl}/profile`, data).pipe(
      tap(user => {
        this.userProfile.set(user);
        this.isLoading.set(false);
        // Update AuthService signal and localStorage
        this.authService.updateCurrentUser(user);
      })
    );
  }

  getUserProfile(): UserProfile | null {
    const user = this.userProfile();
    if (!user) return null;
    
    return {
      name: user.name,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      unitPreference: user.preferences?.weightUnit === 'kg' ? 'Metric' : 'Imperial'
    };
  }

  getFitnessGoals(): FitnessGoals | null {
    const user = this.userProfile();
    if (!user) return null;

    // Map backend goal to frontend format
    let fitnessGoal: 'Weight Loss' | 'Weight Gain' | 'Maintain' = 'Maintain';
    if (user.goal === 'loss') fitnessGoal = 'Weight Loss';
    else if (user.goal === 'gain') fitnessGoal = 'Weight Gain';

    // Map activity level number to string
    let activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Very Active' | 'Extra Active' = 'Moderate';
    if (user.activityLevel <= 1.2) activityLevel = 'Sedentary';
    else if (user.activityLevel <= 1.375) activityLevel = 'Light';
    else if (user.activityLevel <= 1.55) activityLevel = 'Moderate';
    else if (user.activityLevel <= 1.725) activityLevel = 'Very Active';
    else activityLevel = 'Extra Active';

    return {
      fitnessGoal,
      targetWeight: user.weight, // Can be enhanced later
      activityLevel
    };
  }

  getCalculations(): Calculations {
    const user = this.userProfile();
    if (!user) {
      return { bmr: 0, tdee: 0, dailyCalorieTarget: 0 };
    }

    return {
      bmr: user.bmr || 0,
      tdee: user.tdee || 0,
      dailyCalorieTarget: user.dailyCalorieTarget || 0
    };
  }

  // Keep local update methods for backward compatibility with components
  updateUserProfile(profile: UserProfile) {
    const user = this.userProfile();
    if (user) {
      const updatedData: Partial<User> = {
        name: profile.name,
        age: profile.age,
        gender: profile.gender as 'male' | 'female' | 'other',
        height: profile.height,
        weight: profile.weight
      };
      this.updateProfile(updatedData).subscribe();
    }
  }

  updateFitnessGoals(goals: FitnessGoals) {
    const user = this.userProfile();
    if (user) {
      // Map frontend format to backend
      let backendGoal: 'loss' | 'gain' | 'maintain' = 'maintain';
      if (goals.fitnessGoal === 'Weight Loss') backendGoal = 'loss';
      else if (goals.fitnessGoal === 'Weight Gain') backendGoal = 'gain';

      // Map activity level string to number
      let activityLevel = 1.55;
      if (goals.activityLevel === 'Sedentary') activityLevel = 1.2;
      else if (goals.activityLevel === 'Light') activityLevel = 1.375;
      else if (goals.activityLevel === 'Moderate') activityLevel = 1.55;
      else if (goals.activityLevel === 'Very Active') activityLevel = 1.725;
      else if (goals.activityLevel === 'Extra Active') activityLevel = 1.9;

      const updatedData: Partial<User> = {
        goal: backendGoal,
        activityLevel,
        weight: goals.targetWeight
      };
      this.updateProfile(updatedData).subscribe();
    }
  }
  updateWaterGoal(goal: number) {
    this.updateProfile({ waterGoal: goal }).subscribe();
  }
}
