import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="stat-card-3d" [ngClass]="'theme-' + (iconColorClass || 'indigo')">
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        <div class="stat-icon-pod" [ngClass]="iconColorClass">
          <app-icon [name]="icon" [size]="20" [strokeWidth]="2.3"></app-icon>
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
    .stat-card-3d {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-2xl);
      padding: 1.35rem 1.5rem;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }

    .stat-card-3d:active {
      transform: translateY(1px) scale(0.99);
    }

    .stat-card-3d::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      opacity: 0;
      transition: opacity 0.25s;
    }

    .stat-card-3d:hover {
      box-shadow: 0 16px 32px -6px rgba(15, 23, 42, 0.12), 0 0 20px rgba(99, 102, 241, 0.12);
      transform: translateY(-4px) scale(1.01);
      border-color: rgba(99, 102, 241, 0.3);
    }

    .stat-card-3d:hover::before {
      opacity: 1;
    }

    .theme-icon-indigo:hover::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
    .theme-icon-emerald:hover::before { background: linear-gradient(90deg, #10b981, #34d399); }
    .theme-icon-purple:hover::before { background: linear-gradient(90deg, #a855f7, #c084fc); }
    .theme-icon-amber:hover::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .theme-icon-rose:hover::before { background: linear-gradient(90deg, #f43f5e, #fb7185); }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.875rem;
    }

    .stat-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .stat-icon-pod {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      transition: transform 0.25s;
    }

    .stat-card-3d:hover .stat-icon-pod {
      transform: scale(1.08) rotate(3deg);
    }

    .icon-indigo {
      background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
      color: #4f46e5;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
    }

    .icon-emerald {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      color: #059669;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }

    .icon-purple {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      color: #7c3aed;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
    }

    .icon-amber {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      color: #d97706;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    }

    .icon-rose {
      background: linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%);
      color: #e11d48;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.025em;
      line-height: 1.15;
    }

    [data-theme="dark"] .stat-value {
      color: #ffffff;
    }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.8125rem;
      flex-wrap: wrap;
    }

    .stat-delta {
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
    }

    .delta-up {
      background-color: #ecfdf5;
      color: #059669;
    }

    .delta-down {
      background-color: #fff1f2;
      color: #e11d48;
    }

    .stat-subtext {
      color: var(--slate-500);
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtext?: string;
  @Input() icon: string = 'activity';
  @Input() iconColorClass: string = 'icon-indigo';
  @Input() delta?: string;
  @Input() deltaPositive: boolean = true;
}
