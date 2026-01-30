export interface User {
  _id?: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  goal: 'loss' | 'gain' | 'maintain';
  activityLevel: number;
  bmr?: number;
  tdee?: number;
  dailyCalorieTarget?: number;
  targetWeight?: number;
  weeklyWorkoutDays?: number;
  targetWater?: number;
  waterGoal?: number;
  pace?: 'slow' | 'moderate' | 'fast';
  profilePicture?: string;
  preferences?: {
    weightUnit: 'kg' | 'lbs';
    waterUnit: 'ml' | 'oz';
  };
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}
