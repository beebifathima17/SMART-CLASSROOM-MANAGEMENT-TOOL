import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  protected authService = inject(AuthService);

  // Interactive Live Demo preview simulation state
  selectedDemoOption: string = 'Angular Signals & Standalone';
  demoVotes = {
    'HTML Semantic Tags': 12,
    'CSS Grid & Flexbox': 24,
    'JavaScript Promises & Event Loop': 45,
    'Angular Signals & Standalone': 68
  };
  hasVoted = false;

  voteDemo(option: string): void {
    if (this.hasVoted) return;
    this.selectedDemoOption = option;
    this.demoVotes[option as keyof typeof this.demoVotes]++;
    this.hasVoted = true;
  }

  getTotalVotes(): number {
    return Object.values(this.demoVotes).reduce((a, b) => a + b, 0);
  }

  getPercentage(votes: number): number {
    return Math.round((votes / this.getTotalVotes()) * 100);
  }
}
