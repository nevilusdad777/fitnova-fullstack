import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../core/auth/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = `${environment.apiUrl}/auth`;
    
    currentUser = signal<User | null>(null);

    constructor() {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                this.currentUser.set(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap((response) => {
                const { token, ...userData } = response;
                const user: User = {
                    ...userData,
                    token
                };
                this.currentUser.set(user);
                if (token) {
                    localStorage.setItem('token', token);
                }
                localStorage.setItem('user', JSON.stringify(user));
                this.router.navigate(['/home']);
            })
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap((response) => {
                const user: User = {
                    ...data,
                    _id: response._id,
                    token: response.token
                };
                this.currentUser.set(user);
                if (response.token) {
                    localStorage.setItem('token', response.token);
                }
                localStorage.setItem('user', JSON.stringify(user));
                this.router.navigate(['/home']);
            })
        );
    }

    updateCurrentUser(user: User) {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        return !!token;
    }

    logout() {
        this.currentUser.set(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(password: string, token: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/reset-password/${token}`, { password });
    }
}
