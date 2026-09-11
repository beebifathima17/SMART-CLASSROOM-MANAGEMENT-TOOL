import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-content" [style.max-width]="maxWidth" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ title }}</h3>
              @if (subtitle) {
                <p class="modal-subtitle">{{ subtitle }}</p>
              }
            </div>
            <button
              type="button"
              class="modal-close-btn"
              (click)="close()"
              aria-label="Close modal"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <ng-content select="[modal-body]"></ng-content>
          </div>

          <div class="modal-footer" *ngIf="hasFooter">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--slate-900);
    }
    .modal-subtitle {
      font-size: 0.8125rem;
      color: var(--slate-500);
      margin-top: 0.125rem;
    }
    .modal-close-btn {
      background: transparent;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
      padding: 0.375rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .modal-close-btn:hover {
      color: var(--slate-700);
      background-color: var(--slate-100);
    }
  `]
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() maxWidth: string = '540px';
  @Input() hasFooter: boolean = true;

  @Output() closeEvent = new EventEmitter<void>();

  close(): void {
    this.closeEvent.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}
