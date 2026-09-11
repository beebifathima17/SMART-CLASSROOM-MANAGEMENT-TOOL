import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserRole } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent {
  protected authService = inject(AuthService);
  private toast = inject(ToastService);

  searchQuery: string = '';
  roleFilter: string = 'all';

  isAddUserModalOpen = false;
  newUser = {
    name: '',
    email: '',
    role: 'student' as UserRole,
    department: 'Computer Science & Engineering',
    institution: 'University Campus'
  };

  get filteredUsers(): User[] {
    const list = this.authService.users();
    return list.filter(u => {
      const matchQuery = (u.name || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                         (u.email || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchRole = this.roleFilter === 'all' || u.role === this.roleFilter;
      return matchQuery && matchRole;
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const updated = { ...user, status: newStatus as 'active' | 'inactive' };
    this.authService.updateUser(updated);
    this.toast.info(`Account status for ${user.name} changed to ${newStatus.toUpperCase()}`);
  }

  openAddModal(): void {
    this.isAddUserModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddUserModalOpen = false;
  }

  saveNewUser(): void {
    if (!this.newUser.name || !this.newUser.email) {
      this.toast.error('Please provide full name and email.');
      return;
    }

    const created: User = {
      id: `u-${Date.now()}`,
      name: this.newUser.name.trim(),
      email: this.newUser.email.trim(),
      role: this.newUser.role,
      department: this.newUser.department,
      institution: this.newUser.institution,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.newUser.name)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    this.authService.addUser(created);
    this.toast.success(`User ${created.name} registered successfully!`, 'User Added');
    this.closeAddModal();
    this.newUser = {
      name: '',
      email: '',
      role: 'student',
      department: 'Computer Science & Engineering',
      institution: 'University Campus'
    };
  }
}
