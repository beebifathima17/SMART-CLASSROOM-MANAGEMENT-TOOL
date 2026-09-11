import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Quiz } from '../../../core/models/quiz.model';
import { ToastService } from '../../../core/services/toast.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-teacher-quizzes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, ModalComponent],
  templateUrl: './teacher-quizzes.component.html',
  styleUrls: ['./teacher-quizzes.component.css']
})
export class TeacherQuizzesComponent {
  protected quizService = inject(QuizService);
  protected classroomService = inject(ClassroomService);
  private router = inject(Router);
  private toast = inject(ToastService);

  selectedFilter: 'all' | 'published' | 'closed' | 'draft' = 'all';
  searchTerm = '';

  selectedQuizForPreview: Quiz | null = null;
  isPreviewModalOpen = false;

  filteredQuizzes = computed(() => {
    return this.quizService.quizzes().filter(q => {
      const matchFilter = this.selectedFilter === 'all' || q.status === this.selectedFilter;
      const matchSearch = !this.searchTerm ||
        q.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (q.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    });
  });

  goToCreateQuiz(): void {
    this.router.navigate(['/teacher/quizzes/create']);
  }

  toggleQuizStatus(quiz: Quiz): void {
    const nextStatus: 'published' | 'draft' | 'closed' = quiz.status === 'published' ? 'closed' : 'published';
    this.quizService.updateQuiz(quiz.id, { status: nextStatus });
    if (nextStatus === 'published') {
      this.toast.success(`Quiz "${quiz.title}" is now LIVE to all enrolled students!`, 'Quiz Published');
    } else {
      this.toast.info(`Quiz "${quiz.title}" closed.`, 'Quiz Closed');
    }
  }

  openPreview(quiz: Quiz): void {
    this.selectedQuizForPreview = quiz;
    this.isPreviewModalOpen = true;
  }

  closePreview(): void {
    this.selectedQuizForPreview = null;
    this.isPreviewModalOpen = false;
  }

  deleteQuiz(quiz: Quiz, event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete quiz "${quiz.title}"? This will also remove any student submissions.`)) {
      this.quizService.deleteQuiz(quiz.id);
    }
  }
}
