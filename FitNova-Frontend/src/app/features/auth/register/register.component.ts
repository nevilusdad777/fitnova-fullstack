import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { LucideAngularModule, User, Mail, Lock, Heart } from 'lucide-angular';
import { HttpClientModule } from '@angular/common/http';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule, HttpClientModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal<string>('');
    readonly User = User;
    readonly Mail = Mail;
    readonly Lock = Lock;
    readonly Heart = Heart;

    constructor(private fb: FormBuilder, private authService: AuthService) {
        this.registerForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            age: [25, [Validators.required, Validators.min(10), Validators.max(120)]],
            gender: ['male', Validators.required],
            height: [175, [Validators.required, Validators.min(50), Validators.max(300)]],
            weight: [70, [Validators.required, Validators.min(20), Validators.max(500)]],
            activityLevel: [1.375, Validators.required],
            goal: ['loss', Validators.required]
        });
    }

    ngOnInit(): void {
        console.log('RegisterComponent initialized');
    }

    get nameErrors(): string {
        const control = this.registerForm.get('name');
        if (control?.touched && control?.errors) {
            if (control.errors['required']) return 'Full name is required';
        }
        return '';
    }

    get emailErrors(): string {
        const control = this.registerForm.get('email');
        if (control?.touched && control?.errors) {
            if (control.errors['required']) return 'Email is required';
            if (control.errors['email']) return 'Please enter a valid email address';
        }
        return '';
    }

    get passwordErrors(): string {
        const control = this.registerForm.get('password');
        if (control?.touched && control?.errors) {
            if (control.errors['required']) return 'Password is required';
            if (control.errors['minlength']) return 'Password must be at least 6 characters';
        }
        return '';
    }

    get ageErrors(): string {
        const control = this.registerForm.get('age');
        if (control?.touched && control?.errors) {
            if (control.errors['required']) return 'Age is required';
            if (control.errors['min']) return 'Age must be at least 10 years';
            if (control.errors['max']) return 'Age must be less than 120 years';
        }
        return '';
    }

    get heightErrors(): string {
        const control = this.registerForm.get('height');
        if (control?.touched && control?.errors) {
            if (control.errors['required']) return 'Height is required';
            if (control.errors['min']) return 'Height must be at least 50 cm';
            if (control.errors['max']) return 'Height must be less than 300 cm';
        }
        return '';
    }

    get weightErrors(): string {
        const control = this.registerForm.get('weight');
        if (control?.touched && control?.errors) {
            if (control.errors['required']) return 'Weight is required';
            if (control.errors['min']) return 'Weight must be at least 20 kg';
            if (control.errors['max']) return 'Weight must be less than 500 kg';
        }
        return '';
    }

    onSubmit() {
        // Mark all fields as touched to trigger validation messages
        Object.keys(this.registerForm.controls).forEach(key => {
            this.registerForm.get(key)?.markAsTouched();
        });

        if (this.registerForm.valid) {
            this.isLoading.set(true);
            this.errorMessage.set('');
            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    console.log('Registration successful');
                },
                error: (err) => {
                    this.isLoading.set(false);
                    console.error('Registration error', err);
                    
                    // Display user-friendly error messages
                    if (err.status === 400) {
                        if (err.error?.message?.includes('email')) {
                            this.errorMessage.set('This email is already registered. Please use a different email or try logging in.');
                        } else {
                            this.errorMessage.set(err.error?.message || 'Invalid registration data. Please check your information and try again.');
                        }
                    } else if (err.status === 0) {
                        this.errorMessage.set('Unable to connect to server. Please check your internet connection.');
                    } else {
                        this.errorMessage.set(err.error?.message || 'An error occurred during registration. Please try again.');
                    }
                }
            });
        }
    }
}
