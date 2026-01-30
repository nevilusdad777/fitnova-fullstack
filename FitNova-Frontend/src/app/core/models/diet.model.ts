export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

export interface Food {
  _id: string;
  name: string;
  category: string;
  isVegetarian: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
  servingUnit: string;
  verified?: boolean;
  apiSource?: string;
  image?: string;
}

export interface Meal {
  _id: string;
  user: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  completed?: boolean;
  completedAt?: Date | null;
  createdAt?: string;
  updatedAt?: string;
}
