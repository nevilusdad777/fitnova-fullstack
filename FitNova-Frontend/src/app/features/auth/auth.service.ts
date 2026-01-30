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
                const user: User = {
                    _id: response._id,
                    name: response.name,
                    email: response.email,
                    token: response.token,
                    profilePicture: response.profilePicture,
                    age: 0,
                    gender: 'other',
                    height: 0,
                    weight: 0,
                    goal: 'maintain',
                    activityLevel: 1.2
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

    logout() {
        this.currentUser.set(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
    }
}
