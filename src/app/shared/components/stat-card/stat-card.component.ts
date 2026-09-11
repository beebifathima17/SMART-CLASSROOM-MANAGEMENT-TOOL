import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, IconComponent],
  template: `
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        <div class="stat-icon-wrapper" [ngClass]="iconColorClass">
          <app-icon [name]="icon" [size]="20" [strokeWidth]="2.2"></app-icon>
        </div>
      </div>
      <div class="stat-body">
        <div class="stat-value">{{ value }}</div>
        @if (subtext || delta) {
          <div class="stat-footer">
            @if (delta) {
              <span
                class="stat-delta"
                [ngClass]="deltaPositive ? 'delta-up' : 'delta-down'"
              >
                {{ deltaPositive ? '↑' : '↓' }} {{ delta }}
              </span>
            }
            @if (subtext) {
              <span class="stat-subtext">{{ subtext }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all var(--transition-normal);
    }

    .stat-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
      border-color: var(--primary-200);
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .stat-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-indigo { background-color: var(--primary-50); color: var(--primary-600); }
    .icon-emerald { background-color: #ecfdf5; color: var(--accent-emerald); }
    .icon-purple { background-color: #f5f3ff; color: var(--accent-purple); }
    .icon-amber { background-color: #fffbeb; color: var(--accent-amber); }
    .icon-rose { background-color: #fff1f2; color: var(--accent-rose); }

    .stat-value {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.375rem;
      font-size: 0.8125rem;
    }

    .stat-delta {
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
    }

    .delta-up {
      background-color: #ecfdf5;
      color: var(--accent-emerald);
    }

    .delta-down {
      background-color: #fff1f2;
      color: var(--accent-rose);
    }

    .stat-subtext {
      color: var(--slate-500);
    }
  `]
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() icon: string = 'bar-chart-3';
  @Input() iconColorClass: string = 'icon-indigo';
  @Input() delta?: string;
  @Input() deltaPositive: boolean = true;
  @Input() subtext?: string;
}
