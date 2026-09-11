import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';
import { Quiz } from '../../../core/models/quiz.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-quiz-runner',
  imports: [CommonModule, RouterModule, IconComponent, ConfirmModalComponent],
  templateUrl: './quiz-runner.component.html',
  styleUrls: ['./quiz-runner.component.css']
})
export class QuizRunnerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected quizService = inject(QuizService);
  protected authService = inject(AuthService);
  private toast = inject(ToastService);
  protected String = String;

  quiz: Quiz | null = null;
  currentQuestionIndex: number = 0;
  selectedAnswers: Record<string, string> = {}; // questionId -> optionId

  timeRemainingSeconds: number = 600; // 10 mins
  timeTakenSeconds: number = 0;
  private timer: any = null;

  isSubmitConfirmOpen = false;

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id') || 'quiz-201';
    const foundQuiz = this.quizService.getQuizById(quizId);
    if (!foundQuiz) {
      this.toast.error('Quiz assessment not found.');
      this.router.navigate(['/student/dashboard']);
      return;
    }

    this.quiz = foundQuiz;
    this.timeRemainingSeconds = (this.quiz.durationMinutes || 10) * 60;

    this.timer = setInterval(() => {
      this.timeTakenSeconds++;
      if (this.timeRemainingSeconds > 0) {
        this.timeRemainingSeconds--;
      } else {
        clearInterval(this.timer);
        this.autoSubmit();
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  selectOption(questionId: string, optionId: string): void {
    this.selectedAnswers[questionId] = optionId;
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion(): void {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  jumpToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  openSubmitConfirmation(): void {
    this.isSubmitConfirmOpen = true;
  }

  get answeredCount(): number {
    return Object.keys(this.selectedAnswers).length;
  }

  get unAnsweredCount(): number {
    if (!this.quiz) return 0;
    return this.quiz.questions.length - this.answeredCount;
  }

  confirmSubmit(): void {
    this.isSubmitConfirmOpen = false;
    if (!this.quiz) return;

    const student = this.authService.currentUser();
    const submission = this.quizService.submitQuiz(
      this.quiz.id,
      student?.id || `stu-${Date.now()}`,
      student?.name || 'Student',
      this.selectedAnswers,
      this.timeTakenSeconds
    );

    this.router.navigate(['/student/quizzes/result', this.quiz.id]);
  }

  autoSubmit(): void {
    this.toast.warning('Time limit expired! Automatically evaluating quiz.', 'Time Up');
    this.confirmSubmit();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
