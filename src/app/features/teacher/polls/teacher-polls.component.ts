import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PollService } from '../../../core/services/poll.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Poll } from '../../../core/models/poll.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-teacher-polls',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './teacher-polls.component.html',
  styleUrls: ['./teacher-polls.component.css']
})
export class TeacherPollsComponent {
  protected pollService = inject(PollService);
  protected classroomService = inject(ClassroomService);
  private router = inject(Router);
  private toast = inject(ToastService);

  selectedFilter = 'all'; // 'all' | 'active' | 'ended' | 'draft'
  searchTerm = '';

  filteredPolls = computed(() => {
    return this.pollService.polls().filter(p => {
      const matchFilter = this.selectedFilter === 'all' || p.status === this.selectedFilter;
      const matchSearch = !this.searchTerm ||
        p.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.question.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.subject || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    });
  });

  goToCreatePoll(): void {
    this.router.navigate(['/teacher/polls/create']);
  }

  launchPoll(pollId: string): void {
    this.pollService.startPoll(pollId);
    this.router.navigate(['/teacher/polls/live']);
  }

  endPoll(pollId: string): void {
    this.pollService.endPoll(pollId);
  }

  viewLive(pollId: string): void {
    this.pollService.startPoll(pollId);
    this.router.navigate(['/teacher/polls/live']);
  }

  deletePoll(poll: Poll, event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete poll "${poll.title}"?`)) {
      this.pollService.deletePoll(poll.id);
    }
  }
}
