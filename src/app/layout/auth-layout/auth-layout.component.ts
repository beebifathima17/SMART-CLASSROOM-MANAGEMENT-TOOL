import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-auth-layout',
  imports: [CommonModule, RouterModule, ToastContainerComponent, IconComponent],
  template: `
    <app-toast-container></app-toast-container>
    <div class="auth-wrapper">
      <div class="auth-container">
        <!-- Brand Header -->
        <div class="auth-brand">
          <a routerLink="/" class="brand-link">
            <div class="brand-logo">
              <app-icon name="sparkles" [size]="22" [strokeWidth]="2.5"></app-icon>
            </div>
            <span class="brand-name">SmartClass</span>
          </a>
          <p class="brand-tagline">Interactive Real-Time Classroom Engagement Platform</p>
        </div>

        <div class="auth-card">
          <router-outlet></router-outlet>
        </div>

        <div class="auth-footer">
          <a routerLink="/" class="back-link">
            <app-icon name="arrow-left" [size]="14"></app-icon>
            Back to Home
          </a>
          <span class="auth-copy">Academic Web Technologies Project</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top, #f1f5f9 0%, #e2e8f0 100%);
      padding: 2rem 1rem;
    }
    .auth-container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .auth-brand {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .brand-link {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.35rem;
    }
    .brand-logo {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, var(--primary-600), var(--accent-purple));
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-glow);
    }
    .brand-name {
      font-size: 1.625rem;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.03em;
    }
    .brand-tagline {
      font-size: 0.8125rem;
      color: var(--slate-500);
    }
    .auth-card {
      width: 100%;
      background-color: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl);
      padding: 2rem;
    }
    .auth-footer {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1.25rem;
      font-size: 0.8125rem;
      color: var(--slate-500);
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 600;
      color: var(--primary-600);
      transition: color 0.15s;
    }
    .back-link:hover {
      color: var(--primary-800);
    }
  `]
})
export class AuthLayoutComponent {}
