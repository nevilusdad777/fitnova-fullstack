import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListResponse {
  admins: Admin[];
  currentPage: number;
  totalPages: number;
  totalAdmins: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAdminsService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAllAdmins(page: number = 1, limit: number = 10, search: string = '', role: string = ''): Observable<AdminListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);

    return this.http.get<AdminListResponse>(`${this.apiUrl}/admin/admins`, { params });
  }

  getAdminById(id: string): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/admin/admins/${id}`);
  }

  createAdmin(adminData: Partial<Admin>): Observable<Admin> {
    return this.http.post<Admin>(`${this.apiUrl}/admin/admins`, adminData);
  }

  updateAdmin(id: string, adminData: Partial<Admin>): Observable<Admin> {
    return this.http.put<Admin>(`${this.apiUrl}/admin/admins/${id}`, adminData);
  }

  deleteAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/admins/${id}`);
  }
}
