import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ClassroomService } from '../../core/services/classroom.service';
import { ThemeService, THEME_OPTIONS, AccentTheme } from '../../core/services/theme.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { ProfileModalComponent } from '../../shared/components/profile-modal/profile-modal.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IconComponent,
    ToastContainerComponent,
    ProfileModalComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  protected authService = inject(AuthService);
  protected classroomService = inject(ClassroomService);
  protected themeService = inject(ThemeService);
  private router = inject(Router);

  isSidebarCollapsed = signal<boolean>(false);
  isMobileSidebarOpen = signal<boolean>(false);
  isNotificationOpen = signal<boolean>(false);
  isProfileDropdownOpen = signal<boolean>(false);
  isProfileModalOpen = signal<boolean>(false);
  isThemeMenuOpen = signal<boolean>(false);

  themeOptions = THEME_OPTIONS;

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(val => !val);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(val => !val);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  toggleNotifications(): void {
    this.isNotificationOpen.update(val => !val);
    this.isProfileDropdownOpen.set(false);
    this.isThemeMenuOpen.set(false);
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen.update(val => !val);
    this.isNotificationOpen.set(false);
    this.isThemeMenuOpen.set(false);
  }

  toggleThemeMenu(): void {
    this.isThemeMenuOpen.update(val => !val);
    this.isNotificationOpen.set(false);
    this.isProfileDropdownOpen.set(false);
  }

  openProfileModal(): void {
    this.isProfileModalOpen.set(true);
    this.isProfileDropdownOpen.set(false);
  }

  closeProfileModal(): void {
    this.isProfileModalOpen.set(false);
  }

  setAccentTheme(accent: AccentTheme): void {
    this.themeService.setAccent(accent);
  }

  logout(): void {
    this.authService.logout();
  }

  getNavItems(): NavItem[] {
    const role = this.authService.userRole();
    if (role === 'teacher') {
      return [
        { label: 'Dashboard', route: '/teacher/dashboard', icon: 'layout-dashboard' },
        { label: 'Classrooms', route: '/teacher/classrooms', icon: 'book-open' },
        { label: 'Live Classroom', route: '/teacher/live-classroom', icon: 'radio', badge: 'LIVE', badgeClass: 'badge-live' },
        { label: 'Polls', route: '/teacher/polls', icon: 'poll' },
        { label: 'Quizzes', route: '/teacher/quizzes', icon: 'quiz' },
        { label: 'Students', route: '/teacher/students', icon: 'users' },
        { label: 'Leaderboard', route: '/teacher/leaderboard', icon: 'award' },
        { label: 'Analytics', route: '/teacher/analytics', icon: 'bar-chart-3' },
        { label: 'Session History', route: '/teacher/session-history', icon: 'history' }
      ];
    } else if (role === 'student') {
      return [
        { label: 'Dashboard', route: '/student/dashboard', icon: 'layout-dashboard' },
        { label: 'Join Classroom', route: '/student/join', icon: 'radio' },
        { label: 'My Polls', route: '/student/live-poll', icon: 'poll', badge: 'Active', badgeClass: 'badge-live' },
        { label: 'My Quizzes', route: '/student/quizzes', icon: 'quiz' },
        { label: 'Leaderboard', route: '/student/leaderboard', icon: 'award' },
        { label: 'Participation', route: '/student/participation', icon: 'bar-chart-3' }
      ];
    } else if (role === 'admin') {
      return [
        { label: 'Admin Dashboard', route: '/admin/dashboard', icon: 'layout-dashboard' },
        { label: 'User Management', route: '/admin/users', icon: 'users' },
        { label: 'Classrooms Directory', route: '/admin/classrooms', icon: 'book-open' }
      ];
    }
    return [];
  }
}
