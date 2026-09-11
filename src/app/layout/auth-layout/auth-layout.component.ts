import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent, IconComponent],
  template: `
    <app-toast-container></app-toast-container>
    <div class="auth-wrapper">
      <!-- 3D Lighting Orbs in Background -->
      <div class="auth-orbs-bg" aria-hidden="true">
        <div class="auth-orb auth-orb-1"></div>
        <div class="auth-orb auth-orb-2"></div>
        <div class="auth-orb auth-orb-3"></div>
      </div>

      <div class="auth-container">
        <!-- Brand Header -->
        <div class="auth-brand">
          <a routerLink="/" class="brand-link">
            <div class="brand-logo-3d">
              <app-icon name="sparkles" [size]="22" [strokeWidth]="2.5"></app-icon>
            </div>
            <span class="brand-name">SmartClass <span class="brand-badge-3d">3D</span></span>
          </a>
          <p class="brand-tagline">Interactive Real-Time Classroom Engagement Platform</p>
        </div>

        <!-- 3D Floating Auth Card -->
        <div class="auth-card-3d">
          <div class="card-glow-line"></div>
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
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0b0f19 80%);
      padding: 2.5rem 1rem;
      position: relative;
      overflow: hidden;
    }

    .auth-orbs-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .auth-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.45;
      animation: floatAuthOrb 10s infinite alternate ease-in-out;
    }

    .auth-orb-1 {
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, #6366f1 0%, transparent 70%);
      top: -100px;
      left: 10%;
    }

    .auth-orb-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #ec4899 0%, transparent 70%);
      bottom: -80px;
      right: 15%;
      animation-duration: 12s;
    }

    .auth-orb-3 {
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
      top: 40%;
      right: 5%;
      animation-duration: 14s;
    }

    @keyframes floatAuthOrb {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-30px) scale(1.1); }
    }

    .auth-container {
      width: 100%;
      max-width: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 10;
    }

    .auth-brand {
      text-align: center;
      margin-bottom: 1.75rem;
    }

    .brand-link {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.4rem;
      text-decoration: none;
    }

    .brand-logo-3d {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 25px rgba(99, 102, 241, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.6);
      transform: perspective(400px) rotateX(8deg);
    }

    .brand-name {
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.03em;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .brand-badge-3d {
      font-size: 0.65rem;
      font-weight: 800;
      background: linear-gradient(135deg, #06b6d4, #6366f1);
      color: #ffffff;
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
    }

    .brand-tagline {
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .auth-card-3d {
      width: 100%;
      background: rgba(17, 24, 39, 0.82);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.18);
      padding: 2.25rem 2rem;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s;
    }

    .card-glow-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, #6366f1, #ec4899, #06b6d4, transparent);
    }

    .auth-footer {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1.5rem;
      font-size: 0.8125rem;
      color: #94a3b8;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
      color: #818cf8;
      text-decoration: none;
      transition: color 0.15s;
    }

    .back-link:hover {
      color: #ffffff;
      text-shadow: 0 0 10px rgba(129, 140, 248, 0.6);
    }
  `]
})
export class AuthLayoutComponent {}
