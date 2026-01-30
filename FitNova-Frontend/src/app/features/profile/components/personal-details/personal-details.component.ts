import { Component, OnInit, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Edit2, Save, X, Camera, Crop } from 'lucide-angular';
import { AuthService } from '../../../auth/auth.service';
import { ProfileService } from '../../../../services/profile.service';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  detailsForm: FormGroup;
  isEditing = signal(false);
  profilePicture = signal<string | null>(null);
  isSaving = signal(false);
  
  // Cropping state
  showCropModal = signal(false);
  originalImage = signal<string | null>(null);
  @ViewChild('cropCanvas') cropCanvas!: ElementRef<HTMLCanvasElement>;
  cropData = {
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
    isDragging: false
  };
  
  // Icons
  readonly Edit2 = Edit2;
  readonly Save = Save;
  readonly X = X;
  readonly Camera = Camera;
  readonly Crop = Crop;

  constructor() {
    this.detailsForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{value: '', disabled: true}],
      age: [null, [Validators.required, Validators.min(10)]],
      gender: ['', Validators.required],
      height: [null, [Validators.required, Validators.min(50)]],
      weight: [null, [Validators.required, Validators.min(20)]],
      activityLevel: [1.2, Validators.required]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (user) => {
        console.log('Profile loaded:', user);
        this.authService.updateCurrentUser(user);
        this.detailsForm.patchValue({
          fullName: user.name,
          email: user.email,
          age: user.age || null,
          gender: user.gender,
          height: user.height || null,
          weight: user.weight || null,
          activityLevel: user.activityLevel
        });
        if (user.profilePicture) {
          this.profilePicture.set(user.profilePicture);
        }
        this.detailsForm.disable();
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        const user = this.authService.currentUser();
        if (user) {
          this.detailsForm.patchValue({
            fullName: user.name,
            email: user.email,
            age: user.age || null,
            gender: user.gender,
            height: user.height || null,
            weight: user.weight || null,
            activityLevel: user.activityLevel
          });
          if (user.profilePicture) {
            this.profilePicture.set(user.profilePicture);
          }
        }
        this.detailsForm.disable();
      }
    });
  }

  toggleEdit() {
    this.isEditing.update(v => !v);
    if (this.isEditing()) {
        this.detailsForm.enable();
        this.detailsForm.get('email')?.disable();
    } else {
        this.detailsForm.disable();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.originalImage.set(e.target.result);
        this.showCropModal.set(true);
        setTimeout(() => this.initCropCanvas(), 100);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  }

  initCropCanvas() {
    if (!this.cropCanvas || !this.originalImage()) return;

    const canvas = this.cropCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const maxSize = 600;
      let width = img.width;
      let height = img.height;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const size = Math.min(width, height) * 0.8;
      this.cropData = {
        startX: (width - size) / 2,
        startY: (height - size) / 2,
        width: size,
        height: size,
        isDragging: false
      };

      this.drawCropOverlay();
    };
    img.src = this.originalImage()!;
  }

  drawCropOverlay() {
    if (!this.cropCanvas) return;
    const canvas = this.cropCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Clear and draw the full image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Save the state before clipping
      ctx.save();

      // Create a clipping path for everything EXCEPT the crop area
      ctx.beginPath();
      // Outer rectangle (entire canvas)
      ctx.rect(0, 0, canvas.width, canvas.height);
      // Inner rectangle (crop area) - drawn counter-clockwise to create a hole
      ctx.rect(this.cropData.startX + this.cropData.width, this.cropData.startY, -this.cropData.width, this.cropData.height);
      ctx.closePath();
      ctx.clip();

      // Now draw the dark overlay - it will only appear outside the crop area
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Restore to remove clipping
      ctx.restore();

      // Draw purple border around crop area
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.cropData.startX, this.cropData.startY, this.cropData.width, this.cropData.height);
      
      // Add corner handles
      const handleSize = 12;
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(this.cropData.startX - handleSize/2, this.cropData.startY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(this.cropData.startX + this.cropData.width - handleSize/2, this.cropData.startY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(this.cropData.startX - handleSize/2, this.cropData.startY + this.cropData.height - handleSize/2, handleSize, handleSize);
      ctx.fillRect(this.cropData.startX + this.cropData.width - handleSize/2, this.cropData.startY + this.cropData.height - handleSize/2, handleSize, handleSize);
    };
    img.src = this.originalImage()!;
  }

  onCanvasMouseDown(event: MouseEvent) {
    const rect = this.cropCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x >= this.cropData.startX && x <= this.cropData.startX + this.cropData.width &&
        y >= this.cropData.startY && y <= this.cropData.startY + this.cropData.height) {
      this.cropData.isDragging = true;
    }
  }

  onCanvasMouseMove(event: MouseEvent) {
    if (!this.cropData.isDragging) return;

    const rect = this.cropCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.cropData.startX = Math.max(0, Math.min(x - this.cropData.width / 2, this.cropCanvas.nativeElement.width - this.cropData.width));
    this.cropData.startY = Math.max(0, Math.min(y - this.cropData.height / 2, this.cropCanvas.nativeElement.height - this.cropData.height));

    this.drawCropOverlay();
  }

  onCanvasMouseUp() {
    this.cropData.isDragging = false;
  }

  confirmCrop() {
    if (!this.cropCanvas || !this.originalImage()) return;

    const sourceCanvas = this.cropCanvas.nativeElement;
    const cropCanvas = document.createElement('canvas');
    const size = 500;
    cropCanvas.width = size;
    cropCanvas.height = size;
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const scaleX = img.width / sourceCanvas.width;
      const scaleY = img.height / sourceCanvas.height;
      
      ctx.drawImage(img,
        this.cropData.startX * scaleX,
        this.cropData.startY * scaleY,
        this.cropData.width * scaleX,
        this.cropData.height * scaleY,
        0, 0, size, size
      );

      const croppedBase64 = cropCanvas.toDataURL('image/jpeg', 0.8);
      this.profilePicture.set(croppedBase64);
      this.closeCropModal();
      console.log('Image cropped and compressed, size:', croppedBase64.length);
    };
    img.src = this.originalImage()!;
  }

  closeCropModal() {
    this.showCropModal.set(false);
    this.originalImage.set(null);
  }

  removeProfilePicture() {
    this.profilePicture.set(null);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.detailsForm.disable();
    this.loadProfile();
  }

  save() {
    if (this.detailsForm.invalid) {
      console.error('Form is invalid:', this.detailsForm.errors);
      return;
    }

    this.isSaving.set(true);
    const rawValues = this.detailsForm.getRawValue();
    const updateData: any = {
      name: rawValues.fullName,
      age: rawValues.age,
      gender: rawValues.gender,
      height: rawValues.height,
      weight: rawValues.weight,
      activityLevel: rawValues.activityLevel,
      profilePicture: this.profilePicture()
    };

    console.log('Saving profile:', updateData);

    this.profileService.updateProfile(updateData).subscribe({
      next: (user) => {
        console.log('Profile saved successfully:', user);
        this.authService.updateCurrentUser(user);
        this.isEditing.set(false);
        this.detailsForm.disable();
        this.isSaving.set(false);
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Error saving profile:', err);
        this.isSaving.set(false);
        alert('Error saving profile: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
