import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { IconComponent } from '../icon/icon.component';
import { ModalComponent } from '../modal/modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css']
})
export class ProfileModalComponent {
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  protected authService = inject(AuthService);
  private toast = inject(ToastService);

  editName = '';
  editEmail = '';
  editInstitution = '';
  editDepartment = '';
  editAvatarUrl = '';

  avatarPresets = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=smart1',
    'https://api.dicebear.com/7.x/shapes/svg?seed=sparkle',
    'https://api.dicebear.com/7.x/identicon/svg?seed=academic',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=mentor',
    'https://api.dicebear.com/7.x/personas/svg?seed=scholar'
  ];

  ngOnChanges(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.editName = user.name || '';
      this.editEmail = user.email || '';
      this.editInstitution = user.institution || '';
      this.editDepartment = user.department || '';
      this.editAvatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select an image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('Image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.editAvatarUrl = reader.result as string;
      this.toast.info('Photo loaded. Click "Save Profile" to apply.', 'Photo Ready');
    };
    reader.readAsDataURL(file);
  }

  selectPreset(url: string): void {
    this.editAvatarUrl = url;
  }

  generateInitialsAvatar(): void {
    this.editAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.editName || 'SmartClass')}`;
  }

  saveProfile(): void {
    const current = this.authService.currentUser();
    if (!current) return;

    if (!this.editName.trim()) {
      this.toast.error('Name cannot be empty.');
      return;
    }

    const updated: User = {
      ...current,
      name: this.editName.trim(),
      institution: this.editInstitution.trim() || 'University Campus',
      department: this.editDepartment.trim() || current.department,
      avatarUrl: this.editAvatarUrl || current.avatarUrl
    };

    this.authService.updateUser(updated);
    // update current session
    localStorage.setItem('smartclass_current_user', JSON.stringify(updated));
    // Trigger internal session refresh
    (this.authService as any).currentUserSignal?.set(updated);

    this.toast.success('Your profile photo and details have been updated!', 'Profile Saved');
    this.closeEvent.emit();
  }

  close(): void {
    this.closeEvent.emit();
  }
}
