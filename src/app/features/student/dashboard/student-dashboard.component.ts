import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { QuizService } from '../../../core/services/quiz.service';
import { PollService } from '../../../core/services/poll.service';
import { TimetableService, TimetableSlot } from '../../../core/services/timetable.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule, FormsModule, RouterModule, StatCardComponent, IconComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent {
  protected authService = inject(AuthService);
  protected classroomService = inject(ClassroomService);
  protected quizService = inject(QuizService);
  protected pollService = inject(PollService);
  protected timetableService = inject(TimetableService);
  private router = inject(Router);

  days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  sections = ['CSE-A', 'CSE-B', 'CSE-C', 'All Sections'];

  selectDay(day: any): void {
    this.timetableService.selectedDay.set(day);
  }

  selectSection(sec: string): void {
    this.timetableService.selectedSection.set(sec);
  }

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
