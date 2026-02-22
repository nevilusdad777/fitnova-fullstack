import { User } from '../models/user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  goal: 'loss' | 'gain' | 'maintain';
  activityLevel: number;
  preferences?: {
    weightUnit: 'kg' | 'lbs';
    waterUnit: 'ml' | 'oz';
  };
}

export interface AuthResponse extends User {
  token: string;
}
