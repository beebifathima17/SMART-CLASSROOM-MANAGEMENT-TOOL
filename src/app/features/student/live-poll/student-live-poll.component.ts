import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PollService } from '../../../core/services/poll.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { ToastService } from '../../../core/services/toast.service';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-student-live-poll',
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, ChartComponent],
  templateUrl: './student-live-poll.component.html',
  styleUrls: ['./student-live-poll.component.css']
})
export class StudentLivePollComponent {
  protected pollService = inject(PollService);
  protected classroomService = inject(ClassroomService);
  protected authService = inject(AuthService);
  private toast = inject(ToastService);

  activePoll = computed(() => this.pollService.activePoll());

  selectedSingleOptionId: string = '';
  selectedMultipleOptionIds: string[] = [];
  ratingValue: number = 4;
  textAnswer: string = '';

  isSubmitted = false;
  showDoubtModal = false;
  doubtQuestion = '';

  openDoubtModal(): void {
    this.showDoubtModal = true;
  }

  closeDoubtModal(): void {
    this.showDoubtModal = false;
    this.doubtQuestion = '';
  }

  submitDoubt(): void {
    const user = this.authService.currentUser();
    this.classroomService.raiseHand(
      { id: user?.id || 'stu-guest', name: user?.name || 'Student' },
      this.doubtQuestion.trim() || undefined
    );
    this.closeDoubtModal();
  }

  get hasAlreadyAnswered(): boolean {
    const poll = this.activePoll();
    if (!poll) return false;
    return this.isSubmitted || !!this.pollService.studentAnsweredPolls()[poll.id];
  }

  get resultChartData(): ChartConfiguration['data'] {
    const poll = this.activePoll();
    if (!poll) return { labels: [], datasets: [] };

    return {
      labels: poll.options.map(o => o.text),
      datasets: [
        {
          label: 'Votes',
          data: poll.options.map(o => o.votes),
          backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
          borderRadius: 6
        }
      ]
    };
  }

  resultChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 2 } },
      x: { grid: { display: false } }
    }
  };

  toggleMultipleOption(optId: string): void {
    if (this.selectedMultipleOptionIds.includes(optId)) {
      this.selectedMultipleOptionIds = this.selectedMultipleOptionIds.filter(id => id !== optId);
    } else {
      this.selectedMultipleOptionIds.push(optId);
    }
  }

  setRating(val: number): void {
    this.ratingValue = val;
  }

  submitResponse(): void {
    const poll = this.activePoll();
    if (!poll) return;

    const student = this.authService.currentUser();
    const studentId = student?.id || `stu-${Date.now()}`;
    const studentName = student?.name || 'Student';

    let selectedIds: string[] = [];

    if (poll.type === 'multiple_choice' || poll.type === 'yes_no') {
      if (poll.allowMultipleAnswers) {
        if (this.selectedMultipleOptionIds.length === 0) {
          this.toast.warning('Please select at least one option.');
          return;
        }
        selectedIds = this.selectedMultipleOptionIds;
      } else {
        if (!this.selectedSingleOptionId) {
          this.toast.warning('Please select an option to submit.');
          return;
        }
        selectedIds = [this.selectedSingleOptionId];
      }
    } else if (poll.type === 'rating') {
      const matchOpt = poll.options[this.ratingValue - 1] || poll.options[0];
      selectedIds = matchOpt ? [matchOpt.id] : [];
    }

    this.pollService.submitVote(
      poll.id,
      studentId,
      studentName,
      selectedIds,
      this.textAnswer
    );

    this.classroomService.updateStudentStatus(studentId, 'answered');
    this.isSubmitted = true;
  }
}
