import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminFood {
  _id: string;
  name: string;
  category: string;
  description: string;
  isVegetarian: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: number;
  servingUnit: string;
  verified: boolean;
  image?: string;
  apiSource: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodListResponse {
  foods: AdminFood[];
  currentPage: number;
  totalPages: number;
  totalFoods: number;
}

export interface FoodStats {
  totalFoods: number;
  categoryDistribution: {
    [key: string]: number;
  };
  vegetarianCount: number;
  verifiedCount: number;
  recentFoods: AdminFood[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminFoodService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAllFoods(
    page: number = 1, 
    limit: number = 10, 
    search: string = '', 
    category: string = '',
    sortField: string = 'name',
    sortDirection: string = 'asc'
  ): Observable<FoodListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortField', sortField)
      .set('sortDirection', sortDirection);

    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);

    return this.http.get<FoodListResponse>(`${this.apiUrl}/admin/foods`, { params });
  }

  getFoodById(id: string): Observable<AdminFood> {
    return this.http.get<AdminFood>(`${this.apiUrl}/admin/foods/${id}`);
  }

  createFood(foodData: Partial<AdminFood>): Observable<AdminFood> {
    return this.http.post<AdminFood>(`${this.apiUrl}/admin/foods`, foodData);
  }

  updateFood(id: string, foodData: Partial<AdminFood>): Observable<AdminFood> {
    return this.http.put<AdminFood>(`${this.apiUrl}/admin/foods/${id}`, foodData);
  }

  deleteFood(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/foods/${id}`);
  }

  getFoodStats(): Observable<FoodStats> {
    return this.http.get<FoodStats>(`${this.apiUrl}/admin/foods/stats/overview`);
  }
}
