import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private adminAuthService: AdminAuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Redirect if already logged in
    if (this.adminAuthService.isAuthenticated()) {
      console.log('AdminLogin - Already authenticated, redirecting to dashboard');
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.cdr.detectChanges(); // Force UI update

    const { email, password } = this.loginForm.value;
    
    console.log('AdminLogin - Attempting login for:', email);

    this.adminAuthService.login(email, password)
      .pipe(
        finalize(() => {
          // This always runs, whether success or error
          this.loading = false;
          this.cdr.detectChanges(); // Force UI update
          console.log('AdminLogin - Request completed, loading:', this.loading);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('AdminLogin - Login successful:', response);
          console.log('AdminLogin - Navigating to /admin/dashboard');
          this.router.navigate(['/admin/dashboard']).then(success => {
            console.log('AdminLogin - Navigation result:', success);
          });
        },
        error: (err) => {
          console.error('AdminLogin - Login failed:', err);
          this.error = err.error?.message || 'Invalid credentials. Please try again.';
          this.cdr.detectChanges(); // Force UI update
          console.log('AdminLogin - Error set:', this.error);
        }
      });
  }
}
