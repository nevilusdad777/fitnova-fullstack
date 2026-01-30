import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-progress-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent {
    @Input() value: number = 0;
    @Input()
    set progress(v: number) {
        this.value = v;
    }
    get progress(): number {
        return this.value;
    }
    @Input() color: string = '';
    @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
    @Input() showLabel: boolean = true;
    @Input() height: string | number = '8px';

    get normalizedHeight(): string {
        return typeof this.height === 'number' ? `${this.height}px` : this.height;
    }
}
