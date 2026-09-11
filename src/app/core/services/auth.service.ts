import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';
import { ToastService } from './toast.service';

export const DEFAULT_USERS: User[] = [];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersSignal = signal<User[]>([]);
  private currentUserSignal = signal<User | null>(null);

  public readonly users = this.usersSignal.asReadonly();
  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  public readonly userRole = computed(() => this.currentUserSignal()?.role || null);

  constructor(private router: Router, private toast: ToastService) {
    this.initUserStorage();
    this.listenToStorage();
  }

  private isDemoUser(u: any): boolean {
    if (!u) return false;
    const email = (u.email || '').toLowerCase();
    const id = u.id || '';
    return (
      id.startsWith('usr-teacher-01') ||
      id.startsWith('usr-student-01') ||
      id.startsWith('usr-student-02') ||
      id.startsWith('usr-admin-01') ||
      email.includes('priya.sharma') ||
      email.includes('aisha.khan') ||
      email.includes('rahul.verma') ||
      email.includes('admin@smartclass.edu')
    );
  }

  private initUserStorage(): void {
    const storedUsers = localStorage.getItem('smartclass_all_users');
    let usersList: User[] = [];
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed)) {
          usersList = parsed.filter(u => !this.isDemoUser(u));
        }
      } catch (e) {
        usersList = [];
      }
    }
    this.usersSignal.set(usersList);
    localStorage.setItem('smartclass_all_users', JSON.stringify(usersList));

    const savedSession = localStorage.getItem('smartclass_current_user');
    if (savedSession) {
      try {
        const parsedUser = JSON.parse(savedSession);
        if (parsedUser && !this.isDemoUser(parsedUser)) {
          this.currentUserSignal.set(parsedUser);
        } else {
          localStorage.removeItem('smartclass_current_user');
          this.currentUserSignal.set(null);
        }
      } catch (e) {
        localStorage.removeItem('smartclass_current_user');
        this.currentUserSignal.set(null);
      }
    } else {
      this.currentUserSignal.set(null);
    }
  }

  private listenToStorage(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'smartclass_all_users' && event.newValue) {
        try {
          const list = JSON.parse(event.newValue);
          this.usersSignal.set(Array.isArray(list) ? list.filter(u => !this.isDemoUser(u)) : []);
        } catch (e) {}
      }
      if (event.key === 'smartclass_current_user' && event.newValue) {
        try {
          const user = JSON.parse(event.newValue);
          if (user && !this.isDemoUser(user)) {
            this.currentUserSignal.set(user);
          } else {
            this.currentUserSignal.set(null);
          }
        } catch (e) {}
      }
    });
  }

  login(email: string, role?: UserRole): boolean {
    const targetRole = role || 'teacher';
    const existing = this.usersSignal().find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (existing) {
      // Update role if the user chose a specific portal tab
      const updatedUser: User = {
        ...existing,
        role: targetRole,
        department: targetRole === 'teacher' ? 'Faculty Department' : targetRole === 'admin' ? 'Administration' : 'Student Body'
      };
      const updatedList = this.usersSignal().map(u => u.id === existing.id ? updatedUser : u);
      this.usersSignal.set(updatedList);
      localStorage.setItem('smartclass_all_users', JSON.stringify(updatedList));

      this.setCurrentUser(updatedUser);
      this.toast.success(`Welcome back, ${updatedUser.name}! (Signed in as ${targetRole.toUpperCase()})`, 'Logged In');
      this.redirectToRoleDashboard(targetRole);
      return true;
    }

    // Auto-create real account with user entered email and selected role
    const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: formattedName || 'Classroom User',
      email: email.trim(),
      role: targetRole,
      institution: 'University Campus',
      department: targetRole === 'teacher' ? 'Faculty Department' : targetRole === 'admin' ? 'Administration' : 'Student Body',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    const updated = [newUser, ...this.usersSignal()];
    this.usersSignal.set(updated);
    localStorage.setItem('smartclass_all_users', JSON.stringify(updated));

    this.setCurrentUser(newUser);
    this.toast.success(`Welcome, ${newUser.name}! Signed in as ${targetRole.toUpperCase()}.`, 'Account Ready');
    this.redirectToRoleDashboard(targetRole);
    return true;
  }

  register(data: { name: string; email: string; role: UserRole; institution: string }): boolean {
    const existing = this.usersSignal().find(
      u => u.email.toLowerCase().trim() === data.email.toLowerCase().trim()
    );

    if (existing) {
      this.setCurrentUser(existing);
      this.toast.info(`Logged into existing account for ${existing.name}`, 'Welcome Back');
      this.redirectToRoleDashboard(existing.role);
      return true;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
      institution: data.institution || 'NIT Campus',
      department: data.role === 'teacher' ? 'Faculty Department' : 'Undergraduate Program',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    const updated = [newUser, ...this.usersSignal()];
    this.usersSignal.set(updated);
    localStorage.setItem('smartclass_all_users', JSON.stringify(updated));

    this.setCurrentUser(newUser);
    this.toast.success(`Account created successfully for ${newUser.name}!`, 'Registration Complete');
    this.redirectToRoleDashboard(newUser.role);
    return true;
  }

  addUser(user: User): void {
    const updated = [user, ...this.usersSignal().filter(u => u.id !== user.id)];
    this.usersSignal.set(updated);
    localStorage.setItem('smartclass_all_users', JSON.stringify(updated));
  }

  updateUser(user: User): void {
    const updated = this.usersSignal().map(u => (u.id === user.id ? user : u));
    this.usersSignal.set(updated);
    localStorage.setItem('smartclass_all_users', JSON.stringify(updated));
    if (this.currentUserSignal()?.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  updateCurrentProfile(user: User): void {
    this.updateUser(user);
    this.setCurrentUser(user);
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('smartclass_current_user');
    this.toast.info('You have been logged out.', 'Signed Out');
    this.router.navigate(['/login']);
  }

  private setCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
    localStorage.setItem('smartclass_current_user', JSON.stringify(user));
  }

  private redirectToRoleDashboard(role: UserRole): void {
    switch (role) {
      case 'teacher':
        this.router.navigate(['/teacher/dashboard']);
        break;
      case 'student':
        this.router.navigate(['/student/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
