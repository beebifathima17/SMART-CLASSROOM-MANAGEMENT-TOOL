import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClassroomService } from '../../../core/services/classroom.service';
import { PollService } from '../../../core/services/poll.service';
import { QuizService } from '../../../core/services/quiz.service';
import { EnrolledStudent } from '../../../core/models/classroom.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StudentDetailModalComponent } from '../../../shared/components/student-detail-modal/student-detail-modal.component';
import { ToastService } from '../../../core/services/toast.service';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-teacher-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StatCardComponent,
    ChartComponent,
    IconComponent,
    StudentDetailModalComponent
  ],
  templateUrl: './teacher-analytics.component.html',
  styleUrls: ['./teacher-analytics.component.css']
})
export class TeacherAnalyticsComponent {
  protected classroomService = inject(ClassroomService);
  protected pollService = inject(PollService);
  protected quizService = inject(QuizService);
  private toast = inject(ToastService);

  activeTimeFilter: 'today' | 'week' | 'month' | 'custom' = 'month';
  studentSearch = '';
  selectedStudent: EnrolledStudent | null = null;
  Math = Math;

  get totalPollResponses(): number {
    return this.pollService.polls().reduce((sum, p) => sum + (p.totalResponses || 0), 0);
  }

  get realAverageScore(): number {
    const quizzes = this.quizService.quizzes();
    if (quizzes.length === 0) return 0;
    const sum = quizzes.reduce((acc, q) => acc + (q.averageScore || 0), 0);
    return Math.round(sum / quizzes.length);
  }

  get quizPerformanceChartData(): ChartConfiguration['data'] {
    const quizzes = this.quizService.quizzes();
    const labels = quizzes.map(q => q.title.length > 20 ? q.title.slice(0, 20) + '...' : q.title);
    const data = quizzes.map(q => q.averageScore || 0);

    return {
      labels: labels.length > 0 ? labels : ['No Quizzes Yet'],
      datasets: [
        {
          label: 'Average Score (%)',
          data: data.length > 0 ? data : [0],
          backgroundColor: '#6366f1',
          borderRadius: 6
        }
      ]
    };
  }

  get pollTypeChartData(): ChartConfiguration['data'] {
    const polls = this.pollService.polls();
    let mc = 0, yn = 0, rating = 0, text = 0;
    polls.forEach(p => {
      if (p.type === 'multiple_choice') mc += (p.totalResponses || 1);
      else if (p.type === 'yes_no') yn += (p.totalResponses || 1);
      else if (p.type === 'rating') rating += (p.totalResponses || 1);
      else text += (p.totalResponses || 1);
    });

    const hasData = mc + yn + rating + text > 0;
    return {
      labels: ['Multiple Choice', 'Yes / No Checks', 'Rating Feedback', 'Open Response'],
      datasets: [
        {
          data: hasData ? [mc, yn, rating, text] : [1, 0, 0, 0],
          backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
        }
      ]
    };
  }

  commonChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' } }
  };

  get filteredStudentRoster(): EnrolledStudent[] {
    return this.classroomService.liveStudents().filter(s =>
      (s.name || '').toLowerCase().includes(this.studentSearch.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(this.studentSearch.toLowerCase())
    );
  }

  setTimeFilter(filter: 'today' | 'week' | 'month' | 'custom'): void {
    this.activeTimeFilter = filter;
  }

  openStudentModal(student: EnrolledStudent): void {
    this.selectedStudent = student;
  }

  closeStudentModal(): void {
    this.selectedStudent = null;
  }

  exportCSV(): void {
    const students = this.classroomService.liveStudents();
    if (students.length === 0) {
      this.toast.error('No student records available to export.');
      return;
    }

    const headers = ['Student ID', 'Full Name', 'Email', 'Status', 'Sessions Attended', 'Polls Answered', 'Quiz Average %', 'Participation %'];
    const rows = students.map(s => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.status}"`,
      s.sessionsAttended || 1,
      s.pollsAnswered || 0,
      `${s.quizAverage || 0}%`,
      `${s.participationPercentage || 100}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartClass_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toast.success('Real attendance & student ledger exported to CSV successfully!', 'CSV Downloaded');
  }

  exportReport(): void {
    window.print();
  }
}
