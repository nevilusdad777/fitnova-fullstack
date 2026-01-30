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

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
  profilePicture?: string;
}
