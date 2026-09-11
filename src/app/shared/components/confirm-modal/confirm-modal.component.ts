import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="cancel()">
        <div class="modal-content" style="max-width: 440px;" (click)="$event.stopPropagation()">
          <div class="modal-body" style="padding: 1.75rem 1.5rem 1.25rem;">
            <div class="confirm-icon-wrapper" [ngClass]="isDanger ? 'bg-rose-50 text-rose' : 'bg-amber-50 text-amber'">
              <app-icon [name]="isDanger ? 'alert-circle' : 'info'" [size]="28"></app-icon>
            </div>
            <h3 class="confirm-title">{{ title }}</h3>
            <p class="confirm-message">{{ message }}</p>
          </div>
          <div class="modal-footer" style="background-color: transparent; padding: 1rem 1.5rem 1.5rem; justify-content: flex-end; gap: 0.75rem;">
            <button type="button" class="btn btn-secondary btn-sm" (click)="cancel()">
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [ngClass]="isDanger ? 'btn-danger' : 'btn-primary'"
              (click)="confirm()"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-icon-wrapper {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .bg-rose-50 { background-color: #fff1f2; color: var(--accent-rose); }
    .bg-amber-50 { background-color: #fffbeb; color: var(--accent-amber); }

    .confirm-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--slate-900);
      margin-bottom: 0.5rem;
    }
    .confirm-message {
      font-size: 0.875rem;
      color: var(--slate-600);
      line-height: 1.45;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() isDanger: boolean = false;

  @Output() confirmEvent = new EventEmitter<void>();
  @Output() cancelEvent = new EventEmitter<void>();

  confirm(): void {
    this.confirmEvent.emit();
  }

  cancel(): void {
    this.cancelEvent.emit();
  }
}
