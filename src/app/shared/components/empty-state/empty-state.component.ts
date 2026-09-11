import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule, IconComponent],
  template: `
    <div class="empty-state-card">
      <div class="empty-icon-circle">
        <app-icon [name]="icon" [size]="28" [strokeWidth]="1.8"></app-icon>
      </div>
      <h4 class="empty-title">{{ title }}</h4>
      <p class="empty-description">{{ description }}</p>
      @if (actionText) {
        <button type="button" class="btn btn-primary btn-sm mt-4" (click)="actionClick.emit()">
          <app-icon name="plus" [size]="16"></app-icon>
          {{ actionText }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      border: 2px dashed var(--slate-200);
      border-radius: var(--radius-xl);
      background-color: var(--slate-50);
    }
    .empty-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-full);
      background-color: var(--primary-50);
      color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .empty-title {
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--slate-900);
      margin-bottom: 0.375rem;
    }
    .empty-description {
      font-size: 0.875rem;
      color: var(--slate-500);
      max-width: 360px;
      line-height: 1.45;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'layers';
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input() actionText?: string;
  @Output() actionClick = new EventEmitter<void>();
}
