import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminExercise {
  _id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  targetMuscle: string;
  difficulty: string;
  description: string;
  instructions: string[];
  defaultSets: number;
  defaultReps: number;
  caloriesPerMinute: number;
  gifUrl?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseListResponse {
  exercises: AdminExercise[];
  currentPage: number;
  totalPages: number;
  totalExercises: number;
}

export interface ExerciseStats {
  totalExercises: number;
  bodyPartDistribution: {
    [key: string]: number;
  };
  difficultyDistribution: {
    [key: string]: number;
  };
  recentExercises: AdminExercise[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminExerciseService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAllExercises(page: number = 1, limit: number = 10, search: string = '', bodyPart: string = '', difficulty: string = ''): Observable<ExerciseListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (bodyPart) params = params.set('bodyPart', bodyPart);
    if (difficulty) params = params.set('difficulty', difficulty);

    return this.http.get<ExerciseListResponse>(`${this.apiUrl}/admin/exercises`, { params });
  }

  getExerciseById(id: string): Observable<AdminExercise> {
    return this.http.get<AdminExercise>(`${this.apiUrl}/admin/exercises/${id}`);
  }

  createExercise(exerciseData: Partial<AdminExercise>): Observable<AdminExercise> {
    return this.http.post<AdminExercise>(`${this.apiUrl}/admin/exercises`, exerciseData);
  }

  updateExercise(id: string, exerciseData: Partial<AdminExercise>): Observable<AdminExercise> {
    return this.http.put<AdminExercise>(`${this.apiUrl}/admin/exercises/${id}`, exerciseData);
  }

  deleteExercise(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/exercises/${id}`);
  }

  getExerciseStats(): Observable<ExerciseStats> {
    return this.http.get<ExerciseStats>(`${this.apiUrl}/admin/exercises/stats/overview`);
  }
}
