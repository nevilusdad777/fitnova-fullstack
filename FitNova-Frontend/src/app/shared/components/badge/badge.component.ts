import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span class="badge" [ngClass]="'badge-' + variant">
      {{ text }}
    </span>
  `,
    styles: [`
    .badge {
      display: inline-block;
      padding: var(--space-xs) var(--space-md);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      text-transform: capitalize;
    }

    .badge-success {
      background: var(--color-success-bg);
      color: var(--color-success);
    }

    .badge-warning {
      background: var(--color-warning-bg);
      color: var(--color-warning);
    }

    .badge-danger {
      background: var(--color-danger-bg);
      color: var(--color-danger);
    }

    .badge-primary {
      background: var(--color-primary);
      color: white;
}
.badge-info {
  background: #dbeafe;
  color: #1e40af;
}
`]
})
export class BadgeComponent {
    @Input() text: string = '';
    @Input() variant: 'success' | 'warning' | 'danger' | 'primary' | 'info' = 'primary';
}
