export interface Exercise {
  _id?: string;
  id?: string;
  name: string;
  bodyPart: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio';
  description?: string;
  sets?: number;
  reps?: number;
  restTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  caloriesPerSet?: number;
  defaultSets?: number;
  defaultReps?: number;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  caloriesPerMinute?: number;
  gifUrl?: string;
  images?: string[];
  instructions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  bodyPart: string;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

export interface WorkoutRoutine {
  _id?: string;
  user?: string;
  name: string;
  description?: string;
  targetBodyParts: string[];
  exercises: RoutineExercise[];
  isActive: boolean;
  estimatedDuration?: number;
  estimatedCalories?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompletedExercise {
  exerciseId?: string;
  name: string;
  bodyPart: string;
  targetSets: number;
  completedSets: number;
  targetReps: number;
  completedReps: number;
  restTime?: number;
  caloriesBurned: number;
  notes?: string;
}

export interface WorkoutHistory {
  _id?: string;
  user?: string;
  routineId?: string;
  routineName: string;
  date: Date | string;
  exercises: CompletedExercise[];
  totalCaloriesBurned: number;
  duration: number;
  completedAt?: Date | string;
  bodyPartsWorked?: string[];
  sessionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  caloriesBurned: number;
}

export interface Workout {
  _id?: string;
  user: string;
  date: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  name?: string;
  exercises: WorkoutExercise[];
  totalCaloriesBurned: number;
  duration: number;
  isRestDay: boolean;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlannedWorkout {
  id: string;
  category: string;
  completed: boolean;
}

export interface WeekDay {
  day: string;
  date: string;
  workouts: PlannedWorkout[];
  isRestDay: boolean;
  isToday: boolean;
}
