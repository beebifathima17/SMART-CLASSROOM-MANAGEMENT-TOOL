import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, IconComponent, ModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  protected authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  selectedRole: UserRole = 'teacher';
  loginForm: FormGroup;
  isForgotPasswordOpen = false;
  forgotEmail = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true]
    });
  }

  setRole(role: UserRole): void {
    this.selectedRole = role;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const email = this.loginForm.value.email;
    this.authService.login(email, this.selectedRole);
  }

  openForgotPassword(): void {
    this.isForgotPasswordOpen = true;
  }

  closeForgotPassword(): void {
    this.isForgotPasswordOpen = false;
  }

  submitForgotPassword(): void {
    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.toast.error('Please enter a valid email address.');
      return;
    }
    this.toast.success(`Password reset link dispatched to ${this.forgotEmail}`, 'Reset Link Sent');
    this.closeForgotPassword();
    this.forgotEmail = '';
  }
}
