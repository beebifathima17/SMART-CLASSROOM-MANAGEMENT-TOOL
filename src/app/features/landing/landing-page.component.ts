import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  protected authService = inject(AuthService);
}
