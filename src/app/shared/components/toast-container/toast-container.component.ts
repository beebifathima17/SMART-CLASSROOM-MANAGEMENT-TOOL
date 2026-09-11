import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, IconComponent],
  template: `
    <div class="toast-wrapper">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="'toast-' + toast.type">
          <div class="toast-icon">
            <app-icon
              [name]="getIconName(toast.type)"
              [size]="18"
              [strokeWidth]="2.5"
            ></app-icon>
          </div>
          <div class="toast-content">
            @if (toast.title) {
              <div class="toast-title">{{ toast.title }}</div>
            }
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button
            type="button"
            class="toast-close"
            (click)="toastService.remove(toast.id)"
            aria-label="Close"
          >
            <app-icon name="x" [size]="14"></app-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      width: calc(100vw - 2.5rem);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-xl);
      background-color: #ffffff;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .toast-success {
      border-left: 4px solid var(--accent-emerald);
      .toast-icon { color: var(--accent-emerald); }
    }

    .toast-error {
      border-left: 4px solid var(--accent-rose);
      .toast-icon { color: var(--accent-rose); }
    }

    .toast-info {
      border-left: 4px solid var(--primary-600);
      .toast-icon { color: var(--primary-600); }
    }

    .toast-warning {
      border-left: 4px solid var(--accent-amber);
      .toast-icon { color: var(--accent-amber); }
    }

    .toast-icon {
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--slate-900);
      margin-bottom: 0.125rem;
    }

    .toast-message {
      font-size: 0.8125rem;
      color: var(--slate-600);
      line-height: 1.35;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
    }

    .toast-close:hover {
      color: var(--slate-700);
      background-color: var(--slate-100);
    }
  `]
})
export class ToastContainerComponent {
  protected toastService = inject(ToastService);

  getIconName(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'check-circle-2';
      case 'error': return 'alert-circle';
      case 'warning': return 'alert-circle';
      case 'info':
      default:
        return 'info';
    }
  }
}
