import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrolledStudent } from '../../../core/models/classroom.model';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-student-detail-modal',
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="!!student"
      title="Student Participation Profile"
      [subtitle]="student ? student.name + ' • ' + student.email : ''"
      maxWidth="620px"
      (closeEvent)="close()"
    >
      <div modal-body *ngIf="student" class="student-profile-body">
        <!-- Header Profile Banner -->
        <div class="profile-card">
          <img
            [src]="student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'"
            [alt]="student.name"
            class="avatar-lg"
          />
          <div class="profile-info">
            <h4 class="student-name">{{ student.name }}</h4>
            <p class="student-dept">Computer Science & Engineering • Roll No: CS23-{{ student.id.slice(-2) }}</p>
            <div class="status-row">
              <span
                class="badge"
                [ngClass]="{
                  'badge-active': student.status === 'active' || student.status === 'answered',
                  'badge-amber': student.status === 'not_responded',
                  'badge-draft': student.status === 'idle'
                }"
              >
                {{ student.status.replace('_', ' ') }}
              </span>
              <span class="last-seen">Last active: {{ student.lastActive }}</span>
            </div>
          </div>
        </div>

        <!-- Metric Grid -->
        <div class="stats-mini-grid">
          <div class="metric-box">
            <span class="metric-label">Overall Participation</span>
            <div class="metric-val text-indigo">{{ student.participationPercentage }}%</div>
            <div class="progress-bar-bg">
              <div class="progress-fill bg-indigo" [style.width.%]="student.participationPercentage"></div>
            </div>
          </div>

          <div class="metric-box">
            <span class="metric-label">Quiz Average</span>
            <div class="metric-val text-emerald">{{ student.quizAverage }}%</div>
            <div class="progress-bar-bg">
              <div class="progress-fill bg-emerald" [style.width.%]="student.quizAverage"></div>
            </div>
          </div>

          <div class="metric-box">
            <span class="metric-label">Sessions Attended</span>
            <div class="metric-val">{{ student.sessionsAttended }} / {{ student.totalSessions }}</div>
            <span class="metric-sub">{{ Math.round((student.sessionsAttended / student.totalSessions) * 100) }}% Attendance</span>
          </div>

          <div class="metric-box">
            <span class="metric-label">Polls Answered</span>
            <div class="metric-val">{{ student.pollsAnswered }} / {{ student.totalPolls }}</div>
            <span class="metric-sub">{{ Math.round((student.pollsAnswered / student.totalPolls) * 100) }}% Poll Response</span>
          </div>
        </div>

        <!-- Recent Activity Tabs & History -->
        <div class="history-section">
          <h5 class="section-title">Recent Class Performance Logs</h5>
          <div class="history-list">
            <div class="history-item">
              <div class="history-bullet bg-emerald"></div>
              <div class="history-details">
                <span class="history-title">Answered: Modern Frontend & Angular Signals Quiz</span>
                <span class="history-meta">Score: 40/40 (100%) • Submitted in 2m 25s</span>
              </div>
              <span class="history-date">Today</span>
            </div>

            <div class="history-item">
              <div class="history-bullet bg-indigo"></div>
              <div class="history-details">
                <span class="history-title">Voted in Poll #1: Lecture Topic Feedback</span>
                <span class="history-meta">Selected: Angular Signals & Dependency Injection</span>
              </div>
              <span class="history-date">Today</span>
            </div>

            <div class="history-item">
              <div class="history-bullet bg-emerald"></div>
              <div class="history-details">
                <span class="history-title">Completed: JavaScript Async & Event Loop Checkpoint</span>
                <span class="history-meta">Score: 30/30 (100%) • Grade: A+</span>
              </div>
              <span class="history-date">Sep 05</span>
            </div>
          </div>
        </div>
      </div>

      <div modal-footer>
        <button type="button" class="btn btn-secondary btn-sm" (click)="close()">
          Close
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .student-profile-body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .profile-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--slate-50);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
    }
    .avatar-lg {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-full);
      object-fit: cover;
      border: 2px solid #ffffff;
      box-shadow: var(--shadow-sm);
    }
    .student-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--slate-900);
    }
    .student-dept {
      font-size: 0.8125rem;
      color: var(--slate-500);
      margin-bottom: 0.375rem;
    }
    .status-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .last-seen {
      font-size: 0.75rem;
      color: var(--slate-400);
    }
    .stats-mini-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.875rem;
    }
    .metric-box {
      padding: 1rem;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .metric-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--slate-500);
      text-transform: uppercase;
    }
    .metric-val {
      font-size: 1.375rem;
      font-weight: 800;
      color: var(--slate-900);
    }
    .metric-sub {
      font-size: 0.75rem;
      color: var(--slate-500);
    }
    .progress-bar-bg {
      height: 6px;
      background: var(--slate-100);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-top: 0.25rem;
    }
    .progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
    }
    .bg-indigo { background-color: var(--primary-600); }
    .bg-emerald { background-color: var(--accent-emerald); }
    .history-section {
      margin-top: 0.5rem;
    }
    .section-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--slate-800);
      margin-bottom: 0.75rem;
    }
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }
    .history-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: var(--radius-md);
      background: var(--slate-50);
      font-size: 0.8125rem;
    }
    .history-bullet {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 0.35rem;
      flex-shrink: 0;
    }
    .history-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .history-title {
      font-weight: 600;
      color: var(--slate-800);
    }
    .history-meta {
      font-size: 0.75rem;
      color: var(--slate-500);
    }
    .history-date {
      font-size: 0.75rem;
      color: var(--slate-400);
      white-space: nowrap;
    }
  `]
})
export class StudentDetailModalComponent {
  @Input() student: EnrolledStudent | null = null;
  @Output() closeEvent = new EventEmitter<void>();

  protected Math = Math;

  close(): void {
    this.closeEvent.emit();
  }
}
