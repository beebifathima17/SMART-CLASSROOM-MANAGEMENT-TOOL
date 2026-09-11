import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  imports: [CommonModule],
  template: `
    <div class="loading-wrapper" [class.full-page]="fullPage">
      <div class="spinner-ring" [style.width.px]="size" [style.height.px]="size"></div>
      @if (label) {
        <span class="spinner-label">{{ label }}</span>
      }
    </div>
  `,
  styles: [`
    .loading-wrapper {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.5rem;
    }
    .full-page {
      position: fixed;
      inset: 0;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(4px);
      z-index: 99999;
    }
    .spinner-ring {
      border: 3px solid rgba(99, 102, 241, 0.2);
      border-top-color: var(--primary-600);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--slate-600);
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: number = 36;
  @Input() label?: string;
  @Input() fullPage: boolean = false;
}
