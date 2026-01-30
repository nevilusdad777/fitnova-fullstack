import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { LucideAngularModule, LogIn, Mail, Lock } from 'lucide-angular';
import { HttpClientModule } from '@angular/common/http';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule, HttpClientModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal<string>('');
    readonly Mail = Mail;
    readonly Lock = Lock;
    readonly LogIn = LogIn;

    constructor(
        private fb: FormBuilder, 
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
        console.log('LoginComponent initialized');
    }

    ngOnInit(): void {
        console.log('Login view loaded');
    }

    get emailErrors(): string {
        const emailControl = this.loginForm.get('email');
        if (emailControl?.touched && emailControl?.errors) {
            if (emailControl.errors['required']) return 'Email is required';
            if (emailControl.errors['email']) return 'Please enter a valid email address';
        }
        return '';
    }

    get passwordErrors(): string {
        const passwordControl = this.loginForm.get('password');
        if (passwordControl?.touched && passwordControl?.errors) {
            if (passwordControl.errors['required']) return 'Password is required';
            if (passwordControl.errors['minlength']) return 'Password must be at least 6 characters';
        }
        return '';
    }

    onSubmit() {
        // Mark all fields as touched to trigger validation messages
        Object.keys(this.loginForm.controls).forEach(key => {
            this.loginForm.get(key)?.markAsTouched();
        });

        if (this.loginForm.valid) {
            this.isLoading.set(true);
            this.errorMessage.set('');
            this.authService.login(this.loginForm.value).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    console.log('Login successful, redirecting to home...');
                    this.router.navigate(['/home']);
                },
                error: (err) => {
                    this.isLoading.set(false);
                    console.error('Login error', err);
                    
                    // Display user-friendly error messages
                    if (err.status === 401 || err.status === 400) {
                        this.errorMessage.set('Invalid email or password. Please check your credentials and try again.');
                    } else if (err.status === 0) {
                        this.errorMessage.set('Unable to connect to server. Please check your internet connection.');
                    } else {
                        this.errorMessage.set(err.error?.message || 'An error occurred during login. Please try again.');
                    }
                }
            });
        }
    }
}
