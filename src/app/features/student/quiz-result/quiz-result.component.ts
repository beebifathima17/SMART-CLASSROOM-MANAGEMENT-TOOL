import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz, QuizSubmission } from '../../../core/models/quiz.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { ChartConfiguration } from 'chart.js';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-quiz-result',
  imports: [CommonModule, RouterModule, IconComponent, ChartComponent],
  templateUrl: './quiz-result.component.html',
  styleUrls: ['./quiz-result.component.css']
})
export class QuizResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected quizService = inject(QuizService);

  quiz: Quiz | null = null;
  submission: QuizSubmission | null = null;

  donutData: ChartConfiguration['data'] = {
    labels: ['Correct', 'Incorrect', 'Unanswered'],
    datasets: [
      {
        data: [4, 0, 0],
        backgroundColor: ['#10b981', '#f43f5e', '#cbd5e1']
      }
    ]
  };

  donutOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id') || 'quiz-201';
    this.quiz = this.quizService.getQuizById(quizId) || this.quizService.quizzes()[0];
    this.submission = this.quizService.getSubmissionForQuiz(quizId) || this.quizService.latestSubmission();

    if (this.submission) {
      this.donutData = {
        labels: ['Correct', 'Incorrect', 'Unanswered'],
        datasets: [
          {
            data: [
              this.submission.correctAnswersCount,
              this.submission.incorrectAnswersCount,
              this.submission.unansweredCount
            ],
            backgroundColor: ['#10b981', '#f43f5e', '#cbd5e1']
          }
        ]
      };

      if (this.submission.percentage >= 75) {
        this.triggerCelebration();
      }
    }
  }

  private triggerCelebration(): void {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  getOptionText(questionId: string, optionId: string): string {
    if (!this.quiz) return optionId;
    const q = this.quiz.questions.find(item => item.id === questionId);
    if (!q) return optionId;
    const opt = q.options.find(o => o.id === optionId);
    return opt ? opt.text : '(Not Answered)';
  }
}
