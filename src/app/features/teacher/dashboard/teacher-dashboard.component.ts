import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { PollService } from '../../../core/services/poll.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StatCardComponent,
    ChartComponent,
    IconComponent
  ],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit {
  protected authService = inject(AuthService);
  protected classroomService = inject(ClassroomService);
  protected pollService = inject(PollService);
  protected quizService = inject(QuizService);
  protected analyticsService = inject(AnalyticsService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  protected Math = Math;

  get totalPollVotes(): number {
    return this.pollService.polls().reduce((sum, p) => sum + (p.totalResponses || 0), 0);
  }

  get avgParticipationRate(): number {
    const students = this.classroomService.liveStudents();
    if (students.length === 0) return 0;
    const sum = students.reduce((acc, s) => acc + (s.participationPercentage || 0), 0);
    return Math.round(sum / students.length);
  }

  get chartData(): ChartConfiguration['data'] {
    const quizzes = this.quizService.quizzes();
    const polls = this.pollService.polls();

    const labels = quizzes.length > 0 ? quizzes.map(q => q.title) : (polls.length > 0 ? polls.map(p => p.title) : ['Initial Session']);
    const quizData = quizzes.map(q => q.averageScore || 0);
    const pollData = polls.map(p => {
      const live = this.classroomService.liveStudents().length || 1;
      return Math.min(100, Math.round((p.totalResponses / live) * 100));
    });

    return {
      labels: labels.map(l => l.length > 18 ? l.slice(0, 18) + '...' : l),
      datasets: [
        {
          label: 'Poll Turnout (%)',
          data: pollData.length > 0 ? pollData : [100],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#4f46e5'
        },
        {
          label: 'Quiz Average (%)',
          data: quizData.length > 0 ? quizData : [0],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          tension: 0.35,
          borderDash: [5, 5],
          fill: false,
          pointBackgroundColor: '#10b981'
        }
      ]
    };
  }

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: { callback: (val) => `${val}%` }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  ngOnInit(): void {}

  enterClassroom(): void {
    this.router.navigate(['/teacher/live-classroom']);
  }

  createPoll(): void {
    this.router.navigate(['/teacher/polls/create']);
  }

  createQuiz(): void {
    this.router.navigate(['/teacher/quizzes/create']);
  }

  startLivePoll(pollId: string): void {
    this.pollService.startPoll(pollId);
    this.router.navigate(['/teacher/polls/live']);
  }
}
