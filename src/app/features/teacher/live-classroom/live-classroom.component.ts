import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClassroomService } from '../../../core/services/classroom.service';
import { PollService } from '../../../core/services/poll.service';
import { QuizService } from '../../../core/services/quiz.service';
import { StudentService } from '../../../core/services/student.service';
import { EnrolledStudent } from '../../../core/models/classroom.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StudentDetailModalComponent } from '../../../shared/components/student-detail-modal/student-detail-modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-live-classroom',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IconComponent,
    StudentDetailModalComponent,
    ConfirmModalComponent,
    ModalComponent
  ],
  templateUrl: './live-classroom.component.html',
  styleUrls: ['./live-classroom.component.css']
})
export class LiveClassroomComponent implements OnInit, OnDestroy {
  protected classroomService = inject(ClassroomService);
  protected pollService = inject(PollService);
  protected quizService = inject(QuizService);
  protected studentService = inject(StudentService);
  private toast = inject(ToastService);
  private router = inject(Router);

  sessionDurationSeconds = 0;
  private timer: any = null;

  selectedStudentForModal: EnrolledStudent | null = null;
  isEndSessionModalOpen = false;

  isAddStudentModalOpen = false;
  newStudent = {
    name: '',
    email: ''
  };

  studentSearchTerm = '';
  filterStatus = 'all';
  Math = Math;
  copiedPin = false;

  ngOnInit(): void {
    if (!this.classroomService.activeClassroom().isLive) {
      this.classroomService.startLiveSession();
    }
    this.updateDuration();
    this.timer = setInterval(() => {
      this.updateDuration();
    }, 1000);
  }

  private updateDuration(): void {
    const epoch = this.classroomService.activeClassroom().sessionStartEpoch || Date.now();
    this.sessionDurationSeconds = Math.max(0, Math.floor((Date.now() - epoch) / 1000));
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  copyPin(): void {
    const code = this.classroomService.activeClassroom().roomCode;
    navigator.clipboard?.writeText(code).catch(() => {});
    this.copiedPin = true;
    this.toast.success(`Classroom PIN "${code}" copied to clipboard! Share it with your students.`, 'PIN Copied');
    setTimeout(() => {
      this.copiedPin = false;
    }, 2500);
  }

  get filteredStudents(): EnrolledStudent[] {
    return this.classroomService.liveStudents().filter(s => {
      const matchSearch = (s.name || '').toLowerCase().includes(this.studentSearchTerm.toLowerCase()) ||
                          (s.email || '').toLowerCase().includes(this.studentSearchTerm.toLowerCase());
      const matchStatus = this.filterStatus === 'all' || s.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  get answeredCount(): number {
    return this.classroomService.liveStudents().filter(s => s.status === 'answered').length;
  }

  get activeCount(): number {
    return this.classroomService.liveStudents().filter(s => s.status === 'active').length;
  }

  get notRespondedCount(): number {
    return this.classroomService.liveStudents().filter(s => s.status === 'not_responded').length;
  }

  get attendanceRate(): number {
    const total = this.classroomService.liveStudents().length;
    return total > 0 ? 100 : 0;
  }

  formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  openStudentModal(student: EnrolledStudent): void {
    this.selectedStudentForModal = student;
  }

  closeStudentModal(): void {
    this.selectedStudentForModal = null;
  }

  openAddStudent(): void {
    this.isAddStudentModalOpen = true;
  }

  closeAddStudent(): void {
    this.isAddStudentModalOpen = false;
  }

  saveStudent(): void {
    if (!this.newStudent.name || !this.newStudent.email) {
      this.toast.error('Please enter student name and email.');
      return;
    }
    this.classroomService.addStudentToRoster(this.newStudent.name, this.newStudent.email);
    this.closeAddStudent();
    this.newStudent = { name: '', email: '' };
  }

  launchQuickYesNoPoll(): void {
    const poll = this.pollService.createPoll({
      classroomId: this.classroomService.activeClassroom().id,
      title: 'Quick Comprehension Check',
      question: 'Is the current concept clear so far?',
      type: 'yes_no',
      options: [
        { id: 'opt-yes', text: 'Yes, fully understood', votes: 0, percentage: 0 },
        { id: 'opt-no', text: 'Needs clarification', votes: 0, percentage: 0 }
      ],
      status: 'active',
      allowMultipleAnswers: false,
      isAnonymous: false,
      showResultsToStudents: true,
      timeLimitSeconds: 45,
      teacherId: 'tea-inst-01',
      teacherName: 'Faculty Instructor',
      subject: this.classroomService.activeClassroom().subject
    });

    this.classroomService.addActivityFeedItem({
      type: 'poll_response',
      message: 'Quick Yes/No comprehension poll launched to all students',
      badgeType: 'primary'
    });

    this.toast.success('Instant comprehension poll launched!', 'Poll Live');
    this.router.navigate(['/teacher/polls/live']);
  }

  askInstantFeedback(): void {
    this.pollService.createPoll({
      classroomId: this.classroomService.activeClassroom().id,
      title: 'Lecture Pace & Clarity Pulse',
      question: 'How well are you following the current live demonstration? (1 = Lost, 5 = Excellent)',
      type: 'rating',
      options: [
        { id: 'f-1', text: '1 Star (Lost)', votes: 0, percentage: 0 },
        { id: 'f-2', text: '2 Stars (Struggling)', votes: 0, percentage: 0 },
        { id: 'f-3', text: '3 Stars (Okay)', votes: 0, percentage: 0 },
        { id: 'f-4', text: '4 Stars (Good)', votes: 0, percentage: 0 },
        { id: 'f-5', text: '5 Stars (Excellent)', votes: 0, percentage: 0 }
      ],
      status: 'active',
      allowMultipleAnswers: false,
      isAnonymous: true,
      showResultsToStudents: true,
      timeLimitSeconds: 60,
      teacherId: 'tea-inst-01',
      teacherName: 'Faculty Instructor',
      subject: this.classroomService.activeClassroom().subject
    });

    this.classroomService.addActivityFeedItem({
      type: 'feedback_given',
      message: 'Pulse feedback check broadcasted to all connected students',
      badgeType: 'warning'
    });

    this.toast.success('Instant pulse check broadcasted to all connected students!', 'Feedback Triggered');
    this.router.navigate(['/teacher/polls/live']);
  }

  triggerCreatePoll(): void {
    this.router.navigate(['/teacher/polls/create']);
  }

  triggerCreateQuiz(): void {
    this.router.navigate(['/teacher/quizzes/create']);
  }

  openEndSessionConfirm(): void {
    this.isEndSessionModalOpen = true;
  }

  confirmEndSession(): void {
    this.isEndSessionModalOpen = false;
    this.classroomService.endLiveSession();
    this.router.navigate(['/teacher/dashboard']);
  }
}
