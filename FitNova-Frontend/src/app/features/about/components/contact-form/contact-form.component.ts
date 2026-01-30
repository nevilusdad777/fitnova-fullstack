import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Send, CheckCircle } from 'lucide-angular';

@Component({
    selector: 'app-contact-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
    templateUrl: './contact-form.component.html',
    styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent {
    readonly Send = Send;
    readonly CheckCircle = CheckCircle;

    contactForm: FormGroup;
    isSubmitting = signal(false);
    isSuccess = signal(false);

    constructor(private fb: FormBuilder) {
        this.contactForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            subject: ['', [Validators.required]],
            message: ['', [Validators.required, Validators.minLength(10)]]
        });
    }

    onSubmit() {
        if (this.contactForm.valid) {
            this.isSubmitting.set(true);
            
            // Simulate API call
            setTimeout(() => {
                this.isSubmitting.set(false);
                this.isSuccess.set(true);
                this.contactForm.reset();
                
                // Reset success message after 5 seconds
                setTimeout(() => this.isSuccess.set(false), 5000);
            }, 1500);
        } else {
            this.markFormGroupTouched(this.contactForm);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if ((control as any).controls) {
                this.markFormGroupTouched(control as any);
            }
        });
    }
}
