import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Quiz } from '../../../core/models/quiz.model';

@Component({
  selector: 'app-student-quizzes',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './student-quizzes.component.html',
  styleUrls: ['./student-quizzes.component.css']
})
export class StudentQuizzesComponent {
  protected quizService = inject(QuizService);
  protected classroomService = inject(ClassroomService);
  protected authService = inject(AuthService);
  private router = inject(Router);

  activeQuizzes = computed(() => {
    return this.quizService.quizzes().filter(q => q.status === 'published');
  });

  allQuizzes = computed(() => {
    return this.quizService.quizzes();
  });

  getSubmission(quizId: string) {
    return this.quizService.getSubmissionForQuiz(quizId);
  }

  isQuizAttempted(quizId: string): boolean {
    return !!this.getSubmission(quizId);
  }

  startQuiz(quizId: string): void {
    this.router.navigate(['/student/quizzes/take', quizId]);
  }

  viewResult(quizId: string): void {
    this.router.navigate(['/student/quizzes/result', quizId]);
  }
}
