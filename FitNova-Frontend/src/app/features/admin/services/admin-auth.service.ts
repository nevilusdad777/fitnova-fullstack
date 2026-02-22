import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';
  private currentAdminSubject: BehaviorSubject<AdminUser | null>;
  public currentAdmin: Observable<AdminUser | null>;

  constructor(private http: HttpClient) {
    const storedAdmin = localStorage.getItem('adminUser');
    this.currentAdminSubject = new BehaviorSubject<AdminUser | null>(
      storedAdmin ? JSON.parse(storedAdmin) : null
    );
    this.currentAdmin = this.currentAdminSubject.asObservable();
  }

  public get currentAdminValue(): AdminUser | null {
    return this.currentAdminSubject.value;
  }

  public get adminToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  login(email: string, password: string): Observable<AdminAuthResponse> {
    return this.http.post<AdminAuthResponse>(`${this.apiUrl}/admin/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('admin_token', response.token);
            localStorage.setItem('adminUser', JSON.stringify({
              _id: response._id,
              name: response.name,
              email: response.email,
              role: response.role
            }));
            this.currentAdminSubject.next({
              _id: response._id,
              name: response.name,
              email: response.email,
              role: response.role
            });
          }
        })
      );
  }

  register(name: string, email: string, password: string): Observable<AdminAuthResponse> {
    return this.http.post<AdminAuthResponse>(`${this.apiUrl}/admin/auth/register`, { name, email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('admin_token', response.token);
            localStorage.setItem('adminUser', JSON.stringify({
              _id: response._id,
              name: response.name,
              email: response.email,
              role: response.role
            }));
            this.currentAdminSubject.next({
              _id: response._id,
              name: response.name,
              email: response.email,
              role: response.role
            });
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('adminUser');
    this.currentAdminSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.adminToken;
  }

  getProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/admin/auth/me`);
  }
}
