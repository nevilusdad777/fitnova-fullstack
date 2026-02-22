import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminAdminsService, Admin } from '../../services/admin-admins.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-form.component.html',
  styleUrls: ['./admin-form.component.css']
})
export class AdminFormComponent implements OnInit {
  adminForm: FormGroup;
  isEditMode = false;
  adminId: string | null = null;
  loading = false;
  submitting = false;
  error = '';

  roles = ['admin', 'superadmin'];

  constructor(
    private fb: FormBuilder,
    private adminAdminsService: AdminAdminsService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.adminForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['admin', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.adminId = this.route.snapshot.paramMap.get('id');
    if (this.adminId) {
      this.isEditMode = true;
      // Password is not required when editing
      this.adminForm.get('password')?.setValidators([Validators.minLength(6)]);
      this.adminForm.get('password')?.updateValueAndValidity();
      this.loadAdmin(this.adminId);
    }
  }

  loadAdmin(id: string): void {
    this.loading = true;
    this.adminAdminsService.getAdminById(id)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (admin) => {
          this.adminForm.patchValue({
            name: admin.name,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load admin details';
          this.cdr.detectChanges();
        }
      });
  }

  onSubmit(): void {
    if (this.adminForm.invalid) {
      this.markFormGroupTouched(this.adminForm);
      return;
    }

    this.submitting = true;
    this.error = '';

    const adminData = { ...this.adminForm.value };
    // Remove password from payload if it's empty during edit
    if (this.isEditMode && !adminData.password) {
      delete adminData.password;
    }

    const request$ = this.isEditMode
      ? this.adminAdminsService.updateAdmin(this.adminId!, adminData)
      : this.adminAdminsService.createAdmin(adminData);

    request$.pipe(finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/admins']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save admin';
          this.cdr.detectChanges();
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.adminForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
