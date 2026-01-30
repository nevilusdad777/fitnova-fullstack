import { Injectable, signal, computed } from '@angular/core';

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
  private userProfile = signal<UserProfile>({
    name: 'Alex Johnson',
    age: 28,
    gender: 'Male',
    height: 175,
    weight: 73.8,
    unitPreference: 'Metric'
  });

  private fitnessGoals = signal<FitnessGoals>({
    fitnessGoal: 'Weight Loss',
    targetWeight: 70,
    activityLevel: 'Moderate'
  });

  getUserProfile(): UserProfile {
    return this.userProfile();
  }

  updateUserProfile(profile: UserProfile) {
    this.userProfile.set(profile);
  }

  getFitnessGoals(): FitnessGoals {
    return this.fitnessGoals();
  }

  updateFitnessGoals(goals: FitnessGoals) {
    this.fitnessGoals.set(goals);
  }

  getCalculations(): Calculations {
    const profile = this.userProfile();
    const goals = this.fitnessGoals();

    const bmr = this.calculateBMR(profile);
    const tdee = this.calculateTDEE(bmr, goals.activityLevel);
    const dailyCalorieTarget = this.calculateDailyTarget(tdee, goals.fitnessGoal);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalorieTarget: Math.round(dailyCalorieTarget)
    };
  }

  private calculateBMR(profile: UserProfile): number {
    // Mifflin-St Jeor Equation
    let weight = profile.weight;
    let height = profile.height;

    // Convert to metric if needed
    if (profile.unitPreference === 'Imperial') {
      weight = weight * 0.453592; // lbs to kg
      height = height * 2.54; // inches to cm
    }

    if (profile.gender === 'Male') {
      return (10 * weight) + (6.25 * height) - (5 * profile.age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * profile.age) - 161;
    }
  }

  private calculateTDEE(bmr: number, activityLevel: string): number {
    const activityMultipliers: { [key: string]: number } = {
      'Sedentary': 1.2,
      'Light': 1.375,
      'Moderate': 1.55,
      'Very Active': 1.725,
      'Extra Active': 1.9
    };

    return bmr * (activityMultipliers[activityLevel] || 1.2);
  }

  private calculateDailyTarget(tdee: number, goal: string): number {
    switch (goal) {
      case 'Weight Loss':
        return tdee - 500; // 500 calorie deficit
      case 'Weight Gain':
        return tdee + 500; // 500 calorie surplus
      case 'Maintain':
      default:
        return tdee;
    }
  }
}