import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { QuizService } from '../../../core/services/quiz.service';
import { PollService } from '../../../core/services/poll.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule, RouterModule, StatCardComponent, IconComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent {
  protected authService = inject(AuthService);
  protected classroomService = inject(ClassroomService);
  protected quizService = inject(QuizService);
  protected pollService = inject(PollService);
  private router = inject(Router);

  joinLiveSession(): void {
    this.router.navigate(['/student/live-poll']);
  }

  takeQuiz(quizId: string): void {
    this.router.navigate(['/student/quizzes/take', quizId]);
  }

  viewQuizResult(quizId: string): void {
    this.router.navigate(['/student/quizzes/result', quizId]);
  }
}
