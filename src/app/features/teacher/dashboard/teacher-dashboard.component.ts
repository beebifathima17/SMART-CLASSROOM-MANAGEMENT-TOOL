import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { PollService } from '../../../core/services/poll.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  TimetableService,
  TimetableSlot,
  ConflictAlert,
  ScheduleNotification
} from '../../../core/services/timetable.service';
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
  protected timetableService = inject(TimetableService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  protected Math = Math;
  copiedPin = false;

  // View state: 'timeline' or 'matrix'
  viewMode = signal<'timeline' | 'matrix'>('timeline');

  // Days list
  days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  sections = ['All Sections', 'CSE-A', 'CSE-B', 'CSE-C'];

  timeSlots = [
    { start: '09:00 AM', end: '10:00 AM', label: '09:00 AM - 10:00 AM' },
    { start: '10:00 AM', end: '11:00 AM', label: '10:00 AM - 11:00 AM' },
    { start: '11:15 AM', end: '12:15 PM', label: '11:15 AM - 12:15 PM' },
    { start: '12:15 PM', end: '01:15 PM', label: '12:15 PM - 01:15 PM' },
    { start: '02:00 PM', end: '03:00 PM', label: '02:00 PM - 03:00 PM' },
    { start: '03:00 PM', end: '04:00 PM', label: '03:00 PM - 04:00 PM' }
  ];

  // Quick Slot Edit / Add Modal State
  isSlotModalOpen = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingSlotId = signal<string | null>(null);

  formModel: Partial<TimetableSlot> = {
    courseCode: '',
    courseName: '',
    facultyName: '',
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Lecture Hall 1',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'indigo',
    status: 'scheduled',
    updateNote: ''
  };

  modalConflicts = signal<ConflictAlert[]>([]);
  forceOverride = signal<boolean>(false);

  // Broadcast Modal State
  isBroadcastModalOpen = signal<boolean>(false);
  broadcastTitle = 'Class Notice: ';
  broadcastMessage = '';
  broadcastType: 'update' | 'reschedule' | 'cancel' | 'conflict' = 'update';

  // Computed KPIs for the Dashboard
  get uniqueRooms(): string[] {
    const rooms = this.timetableService.slots().map(s => s.room);
    return Array.from(new Set(rooms));
  }

  get hasSimulatedCollision(): boolean {
    return this.timetableService.slots().some(s => s.id === 'slot-demo-collision');
  }

  get avgParticipationRate(): number {
    const students = this.classroomService.liveStudents();
    if (students.length === 0) return 0;
    const sum = students.reduce((acc, s) => acc + (s.participationPercentage || 0), 0);
    return Math.round(sum / students.length);
  }

  // Room Utilization & Lab Allocation Chart Data
  get roomUtilizationChartData(): ChartConfiguration['data'] {
    const slots = this.timetableService.slots().filter(s => s.status !== 'cancelled');
    const roomCounts: Record<string, number> = {};

    slots.forEach(s => {
      roomCounts[s.room] = (roomCounts[s.room] || 0) + 1;
    });

    const labels = Object.keys(roomCounts);
    const data = Object.values(roomCounts);

    return {
      labels: labels.length > 0 ? labels : ['Lecture Hall 1', 'Room 302', 'Web Lab 2', 'Room 401'],
      datasets: [
        {
          label: 'Weekly Sessions Allocated',
          data: data.length > 0 ? data : [4, 3, 2, 1],
          backgroundColor: [
            'rgba(99, 102, 241, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(168, 85, 247, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(244, 63, 94, 0.85)'
          ],
          borderColor: [
            '#4f46e5',
            '#10b981',
            '#a855f7',
            '#f59e0b',
            '#f43f5e'
          ],
          borderWidth: 1.5,
          borderRadius: 8
        }
      ]
    };
  }

  roomChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.6)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Engagement trends chart data
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

  // Helper for matrix cells
  getSlotForCell(day: string, timeLabel: string): TimetableSlot | undefined {
    return this.timetableService.slots().find(s => {
      const matchDay = s.day === day;
      const matchSection =
        this.timetableService.selectedSection() === 'All Sections' ||
        s.section === this.timetableService.selectedSection();
      const matchTime = s.timeSlot.includes(timeLabel.split(' - ')[0]) || s.timeSlot === timeLabel;
      return matchDay && matchSection && matchTime;
    });
  }

  // Quick Slot Add / Edit Handlers
  openAddModal(day?: any, start?: string, end?: string): void {
    this.isEditMode.set(false);
    this.editingSlotId.set(null);
    this.modalConflicts.set([]);
    this.forceOverride.set(false);

    this.formModel = {
      courseCode: '',
      courseName: '',
      facultyName: this.authService.currentUser()?.name || 'Dr. Priya Sharma',
      facultyId: this.authService.currentUser()?.id || 'usr-teacher-01',
      day: day || this.timetableService.selectedDay(),
      startTime: start || '09:00 AM',
      endTime: end || '10:00 AM',
      timeSlot: `${start || '09:00 AM'} - ${end || '10:00 AM'}`,
      room: 'Lecture Hall 1',
      section: this.timetableService.selectedSection() === 'All Sections' ? 'CSE-A' : this.timetableService.selectedSection(),
      semester: 'Semester 5',
      type: 'Lecture',
      colorTag: 'indigo',
      status: 'scheduled',
      updateNote: ''
    };

    this.isSlotModalOpen.set(true);
  }

  openEditModal(slot: TimetableSlot, event?: Event): void {
    if (event) event.stopPropagation();
    this.isEditMode.set(true);
    this.editingSlotId.set(slot.id);
    this.modalConflicts.set([]);
    this.forceOverride.set(false);

    this.formModel = { ...slot };
    this.isSlotModalOpen.set(true);
  }

  onFormChange(): void {
    this.formModel.timeSlot = `${this.formModel.startTime} - ${this.formModel.endTime}`;
    const conflicts = this.timetableService.checkConflict(
      this.formModel,
      this.isEditMode() ? this.editingSlotId() || undefined : undefined
    );
    this.modalConflicts.set(conflicts);
  }

  saveSlot(): void {
    if (!this.formModel.courseCode || !this.formModel.courseName || !this.formModel.room) {
      this.toastService.warning('Please complete course code, name, and room.');
      return;
    }

    this.formModel.timeSlot = `${this.formModel.startTime} - ${this.formModel.endTime}`;

    if (this.isEditMode() && this.editingSlotId()) {
      const success = this.timetableService.updateSlot(
        this.editingSlotId()!,
        this.formModel,
        this.forceOverride()
      );
      if (success) this.closeSlotModal();
    } else {
      const success = this.timetableService.addSlot(
        this.formModel as any,
        this.forceOverride()
      );
      if (success) this.closeSlotModal();
    }
  }

  deleteSlot(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm('Are you sure you want to remove this timetable slot?')) {
      this.timetableService.deleteSlot(id);
    }
  }

  closeSlotModal(): void {
    this.isSlotModalOpen.set(false);
  }

  // Broadcast Announcement
  openBroadcastModal(): void {
    this.broadcastTitle = 'Classroom Schedule Notice';
    this.broadcastMessage = '';
    this.broadcastType = 'update';
    this.isBroadcastModalOpen.set(true);
  }

  closeBroadcastModal(): void {
    this.isBroadcastModalOpen.set(false);
  }

  submitBroadcast(): void {
    if (!this.broadcastTitle.trim() || !this.broadcastMessage.trim()) {
      this.toastService.warning('Please enter both title and message.');
      return;
    }
    this.timetableService.broadcastNotification(
      this.broadcastTitle,
      this.broadcastMessage,
      this.broadcastType
    );
    this.closeBroadcastModal();
  }

  // Conflict Engine Testing & Auditing
  runConflictAudit(): void {
    this.timetableService.runConflictAudit();
  }

  toggleSimulatedCollision(): void {
    if (this.hasSimulatedCollision) {
      this.timetableService.resolveCollisionDemo();
    } else {
      this.timetableService.simulateCollisionDemo();
    }
  }

  selectDay(day: any): void {
    this.timetableService.selectedDay.set(day);
  }

  selectSection(section: string): void {
    this.timetableService.selectedSection.set(section);
  }

  // Pin & Legacy Session Handlers
  copyPin(pin: string): void {
    if (!pin) return;
    navigator.clipboard.writeText(pin).then(() => {
      this.copiedPin = true;
      this.toastService.success(`Classroom PIN ${pin} copied to clipboard!`);
      setTimeout(() => {
        this.copiedPin = false;
      }, 2000);
    }).catch(() => {
      this.toastService.info(`Room PIN: ${pin}`);
    });
  }

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
