import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLandingService } from '../services/admin-landing.service';
import { LandingContent, LandingFeature, LandingTestimonial } from '../../../core/services/landing.service';

type TabType = 'hero' | 'stats' | 'features' | 'testimonials';

// Context telling us which image field to update after crop/url
interface ImageContext {
  type: 'hero' | 'feature';
  featureIndex?: number;
}

interface CropBox {
  x: number; y: number; w: number; h: number;
}

@Component({
  selector: 'app-landing-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-content.component.html',
  styleUrls: ['./landing-content.component.css']
})
export class LandingContentComponent implements OnInit {
  activeTab: TabType = 'hero';
  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';

  content: LandingContent = {
    hero: { badgeText: '', title: '', description: '', image: '', ctaText: '' },
    stats: [],
    features: [],
    testimonials: []
  };

  // Track expanded cards
  expandedFeature: number | null = null;
  expandedTestimonial: number | null = null;

  // ===== Image Picker State =====
  pickerOpen = false;
  pickerContext: ImageContext = { type: 'hero' };
  pickerTab: 'upload' | 'url' = 'upload';
  pickerUrlInput = '';

  // Crop modal
  cropModalOpen = false;
  cropSourceDataUrl = '';
  cropBox: CropBox = { x: 0, y: 0, w: 200, h: 150 };
  private cropImg: HTMLImageElement | null = null;
  private cropNaturalW = 0;
  private cropNaturalH = 0;
  private cropDisplayW = 0;
  private cropDisplayH = 0;
  private cropDragging = false;
  private cropResizing = false;
  private cropDragStartX = 0;
  private cropDragStartY = 0;
  private cropBoxStart: CropBox = { x: 0, y: 0, w: 0, h: 0 };
  private readonly HANDLE_SIZE = 10;

  @ViewChild('cropCanvas') cropCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropContainer') cropContainerRef!: ElementRef<HTMLDivElement>;

  constructor(
    private adminLandingService: AdminLandingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.loading = true;
    this.adminLandingService.getLandingContent().subscribe({
      next: (data: LandingContent) => {
        this.content = JSON.parse(JSON.stringify(data));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (_err: unknown) => {
        this.errorMsg = 'Failed to load landing content';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  setTab(tab: TabType): void {
    this.activeTab = tab;
    this.expandedFeature = null;
    this.expandedTestimonial = null;
    this.successMsg = '';
    this.errorMsg = '';
    this.closePicker();
  }

  save(): void {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const payload: Partial<LandingContent> = {};
    if (this.activeTab === 'hero') payload.hero = this.content.hero;
    if (this.activeTab === 'stats') payload.stats = this.content.stats;
    if (this.activeTab === 'features') payload.features = this.content.features;
    if (this.activeTab === 'testimonials') payload.testimonials = this.content.testimonials;

    this.adminLandingService.updateLandingContent(payload).subscribe({
      next: () => {
        this.successMsg = '✅ Saved successfully!';
        this.saving = false;
        this.cdr.markForCheck();
        setTimeout(() => { this.successMsg = ''; this.cdr.markForCheck(); }, 3000);
      },
      error: () => {
        this.errorMsg = '❌ Failed to save. Please try again.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ===== Image Picker API =====

  getImageForContext(ctx: ImageContext): string {
    if (ctx.type === 'hero') return this.content.hero.image;
    if (ctx.type === 'feature' && ctx.featureIndex !== undefined) {
      return this.content.features[ctx.featureIndex]?.image || '';
    }
    return '';
  }

  openPicker(ctx: ImageContext): void {
    this.pickerContext = ctx;
    this.pickerOpen = true;
    this.pickerTab = 'upload';
    this.pickerUrlInput = this.getImageForContext(ctx);
    this.cdr.markForCheck();
  }

  closePicker(): void {
    this.pickerOpen = false;
    this.cdr.markForCheck();
  }

  setPickerTab(tab: 'upload' | 'url'): void {
    this.pickerTab = tab;
  }

  applyUrl(urlArg?: string): void {
    const url = (urlArg ?? this.pickerUrlInput).trim();
    if (!url) return;
    this.setImageOnContext(this.pickerContext, url);
    this.closePicker();
  }

  clearImage(ctx: ImageContext): void {
    this.setImageOnContext(ctx, '');
    this.cdr.markForCheck();
  }

  private setImageOnContext(ctx: ImageContext, value: string): void {
    if (ctx.type === 'hero') {
      this.content.hero.image = value;
    } else if (ctx.type === 'feature' && ctx.featureIndex !== undefined) {
      this.content.features[ctx.featureIndex].image = value;
    }
    this.cdr.markForCheck();
  }

  // ===== File Upload Handler =====

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = ''; // reset so same file can re-trigger

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      this.openCropModal(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  // ===== Crop Modal =====

  openCropModal(dataUrl: string): void {
    this.cropSourceDataUrl = dataUrl;
    this.cropModalOpen = true;
    this.cdr.markForCheck();

    // Load img to get natural dimensions, then draw
    const img = new Image();
    img.onload = () => {
      this.cropImg = img;
      this.cropNaturalW = img.naturalWidth;
      this.cropNaturalH = img.naturalHeight;
      setTimeout(() => {
        this.initCropCanvas();
        this.cdr.markForCheck();
      }, 50);
    };
    img.src = dataUrl;
  }

  closeCropModal(): void {
    this.cropModalOpen = false;
    this.cropImg = null;
    this.cdr.markForCheck();
  }

  private initCropCanvas(): void {
    const canvas = this.cropCanvasRef?.nativeElement;
    const container = this.cropContainerRef?.nativeElement;
    if (!canvas || !container || !this.cropImg) return;

    const maxW = Math.min(container.clientWidth - 32, 700);
    const maxH = Math.min(window.innerHeight * 0.55, 480);
    const ratio = Math.min(maxW / this.cropNaturalW, maxH / this.cropNaturalH, 1);

    this.cropDisplayW = Math.round(this.cropNaturalW * ratio);
    this.cropDisplayH = Math.round(this.cropNaturalH * ratio);

    canvas.width = this.cropDisplayW;
    canvas.height = this.cropDisplayH;

    // Initial crop box = center 80%
    const pw = this.cropDisplayW * 0.8;
    const ph = this.cropDisplayH * 0.8;
    this.cropBox = {
      x: (this.cropDisplayW - pw) / 2,
      y: (this.cropDisplayH - ph) / 2,
      w: pw,
      h: ph
    };
    this.drawCrop();
  }

  private drawCrop(): void {
    const canvas = this.cropCanvasRef?.nativeElement;
    if (!canvas || !this.cropImg) return;
    const ctx = canvas.getContext('2d')!;
    const { x, y, w, h } = this.cropBox;

    // Draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.cropImg, 0, 0, this.cropDisplayW, this.cropDisplayH);

    // Darken outside
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.drawImage(this.cropImg, 0, 0, this.cropDisplayW, this.cropDisplayH);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(this.cropImg, 0, 0, this.cropDisplayW, this.cropDisplayH);
    ctx.restore();

    // Crop border
    ctx.strokeStyle = '#4a90d9';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    // Corner handles
    const hs = this.HANDLE_SIZE;
    const corners = [
      { cx: x, cy: y }, { cx: x + w, cy: y },
      { cx: x, cy: y + h }, { cx: x + w, cy: y + h }
    ];
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#4a90d9';
    ctx.lineWidth = 2;
    for (const c of corners) {
      ctx.fillRect(c.cx - hs / 2, c.cy - hs / 2, hs, hs);
      ctx.strokeRect(c.cx - hs / 2, c.cy - hs / 2, hs, hs);
    }

    // Grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w / 3, y); ctx.lineTo(x + w / 3, y + h);
    ctx.moveTo(x + 2 * w / 3, y); ctx.lineTo(x + 2 * w / 3, y + h);
    ctx.moveTo(x, y + h / 3); ctx.lineTo(x + w, y + h / 3);
    ctx.moveTo(x, y + 2 * h / 3); ctx.lineTo(x + w, y + 2 * h / 3);
    ctx.stroke();
  }

  onCropMouseDown(event: MouseEvent): void {
    const canvas = this.cropCanvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    const { x, y, w, h } = this.cropBox;
    const hs = this.HANDLE_SIZE;

    // Check corner handles first
    const corners = [
      { cx: x, cy: y }, { cx: x + w, cy: y },
      { cx: x, cy: y + h }, { cx: x + w, cy: y + h }
    ];
    for (const c of corners) {
      if (Math.abs(mx - c.cx) < hs && Math.abs(my - c.cy) < hs) {
        this.cropResizing = true;
        this.cropDragging = false;
        this.cropDragStartX = mx;
        this.cropDragStartY = my;
        this.cropBoxStart = { ...this.cropBox };
        return;
      }
    }

    // Inside crop box → drag
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
      this.cropDragging = true;
      this.cropResizing = false;
      this.cropDragStartX = mx;
      this.cropDragStartY = my;
      this.cropBoxStart = { ...this.cropBox };
    }
  }

  onCropMouseMove(event: MouseEvent): void {
    if (!this.cropDragging && !this.cropResizing) return;
    const canvas = this.cropCanvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    const dx = mx - this.cropDragStartX;
    const dy = my - this.cropDragStartY;
    const cW = this.cropDisplayW;
    const cH = this.cropDisplayH;
    const bs = this.cropBoxStart;

    if (this.cropDragging) {
      const newX = Math.max(0, Math.min(cW - bs.w, bs.x + dx));
      const newY = Math.max(0, Math.min(cH - bs.h, bs.y + dy));
      this.cropBox = { ...this.cropBox, x: newX, y: newY };
    } else if (this.cropResizing) {
      // Resize from bottom-right corner (simple approach)
      const newW = Math.max(40, Math.min(cW - bs.x, bs.w + dx));
      const newH = Math.max(30, Math.min(cH - bs.y, bs.h + dy));
      this.cropBox = { ...this.cropBox, w: newW, h: newH };
    }
    this.drawCrop();
  }

  onCropMouseUp(): void {
    this.cropDragging = false;
    this.cropResizing = false;
  }

  applyCrop(): void {
    if (!this.cropImg) return;
    const { x, y, w, h } = this.cropBox;
    const scaleX = this.cropNaturalW / this.cropDisplayW;
    const scaleY = this.cropNaturalH / this.cropDisplayH;

    // Render cropped area at max 800×600
    const outW = Math.min(Math.round(w * scaleX), 800);
    const outH = Math.min(Math.round(h * scaleY), 600);

    const offscreen = document.createElement('canvas');
    offscreen.width = outW;
    offscreen.height = outH;
    const ctx = offscreen.getContext('2d')!;
    ctx.drawImage(
      this.cropImg,
      x * scaleX, y * scaleY,
      w * scaleX, h * scaleY,
      0, 0, outW, outH
    );

    const base64 = offscreen.toDataURL('image/jpeg', 0.85);
    this.setImageOnContext(this.pickerContext, base64);
    this.closeCropModal();
    this.closePicker();
  }

  // ===== Stats ====
  addStat(): void { this.content.stats.push({ value: '', label: '' }); }
  removeStat(i: number): void { this.content.stats.splice(i, 1); }

  // ===== Features =====
  addFeature(): void {
    const newFeature: LandingFeature = {
      title: 'New Feature', description: '', image: '',
      iconName: 'Activity',
      iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      points: []
    };
    this.content.features.push(newFeature);
    this.expandedFeature = this.content.features.length - 1;
  }

  removeFeature(i: number): void {
    this.content.features.splice(i, 1);
    if (this.expandedFeature === i) this.expandedFeature = null;
  }

  toggleFeature(i: number): void {
    this.expandedFeature = this.expandedFeature === i ? null : i;
  }

  addPoint(featureIdx: number): void {
    if (!this.content.features[featureIdx].points) this.content.features[featureIdx].points = [];
    this.content.features[featureIdx].points.push('');
  }

  removePoint(featureIdx: number, pointIdx: number): void {
    this.content.features[featureIdx].points.splice(pointIdx, 1);
  }

  trackByIndex(index: number): number { return index; }

  // ===== Testimonials =====
  addTestimonial(): void {
    const newT: LandingTestimonial = { text: '', name: '', role: '', initials: '', rating: 5 };
    this.content.testimonials.push(newT);
    this.expandedTestimonial = this.content.testimonials.length - 1;
  }

  removeTestimonial(i: number): void {
    this.content.testimonials.splice(i, 1);
    if (this.expandedTestimonial === i) this.expandedTestimonial = null;
  }

  toggleTestimonial(i: number): void {
    this.expandedTestimonial = this.expandedTestimonial === i ? null : i;
  }

  onNameChange(t: LandingTestimonial): void {
    if (t.name) {
      const parts = t.name.trim().split(' ');
      t.initials = parts.map((p: string) => p[0]?.toUpperCase() || '').join('').slice(0, 2);
    }
  }

  getIconOptions(): string[] {
    return ['Activity', 'Apple', 'BarChart3', 'Heart', 'Trophy', 'Zap', 'Users', 'Target', 'Flame', 'Shield', 'TrendingUp'];
  }

  getRatingArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
}
