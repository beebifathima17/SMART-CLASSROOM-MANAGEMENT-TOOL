import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClassroomService } from '../../../core/services/classroom.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-teacher-classrooms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, ModalComponent],
  template: `
    <div class="classrooms-page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Classrooms & Courses</h1>
          <p class="page-subtitle">Manage, create, and launch real-time interactive classrooms for your lectures</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreateModal()">
          <app-icon name="plus" [size]="16"></app-icon>
          Create Classroom
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="stats-row">
        <div class="stat-pill">
          <app-icon name="book-open" [size]="18" customClass="text-indigo-600"></app-icon>
          <div>
            <span class="stat-pill-num">{{ classroomService.classrooms().length }}</span>
            <span class="stat-pill-label">Total Courses</span>
          </div>
        </div>
        <div class="stat-pill">
          <app-icon name="radio" [size]="18" customClass="text-rose-600"></app-icon>
          <div>
            <span class="stat-pill-num">{{ activeLiveCount }}</span>
            <span class="stat-pill-label">Live In Session</span>
          </div>
        </div>
        <div class="stat-pill">
          <app-icon name="users" [size]="18" customClass="text-emerald-600"></app-icon>
          <div>
            <span class="stat-pill-num">{{ classroomService.liveStudents().length }}</span>
            <span class="stat-pill-label">Active Roster Students</span>
          </div>
        </div>
      </div>

      <!-- Classrooms Grid -->
      <div class="classrooms-grid">
        @for (cls of classroomService.classrooms(); track cls.id) {
          <div
            class="classroom-card"
            [class.card-active]="cls.id === classroomService.activeClassroom().id"
          >
            <div class="card-top">
              <div class="card-badge-row">
                <span *ngIf="cls.id === classroomService.activeClassroom().id" class="badge badge-indigo">
                  <app-icon name="check" [size]="12"></app-icon> Active Selected
                </span>
                <span
                  class="badge"
                  [ngClass]="cls.isLive ? 'badge-live' : 'badge-draft'"
                >
                  {{ cls.isLive ? 'Live In Session' : 'Offline / Scheduled' }}
                </span>
              </div>
              <button
                type="button"
                class="btn-delete-icon"
                (click)="deleteClass(cls.id, cls.name)"
                title="Delete Classroom"
              >
                <app-icon name="trash-2" [size]="16"></app-icon>
              </button>
            </div>

            <h3 class="classroom-name">{{ cls.name }}</h3>
            <div class="course-code-pill">{{ cls.courseCode }}</div>

            <div class="info-list">
              <div class="info-row">
                <span class="info-label">Room PIN:</span>
                <div class="pin-box">
                  <strong class="pin-code">{{ cls.roomCode }}</strong>
                  <button
                    type="button"
                    class="btn-copy-pin"
                    (click)="copyPin(cls.roomCode)"
                    title="Copy PIN for Students"
                  >
                    <app-icon name="copy" [size]="13"></app-icon>
                  </button>
                </div>
              </div>
              <div class="info-row">
                <span class="info-label">Schedule:</span>
                <span class="info-val">{{ cls.schedule }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-val">{{ cls.roomLocation }}</span>
              </div>
            </div>

            <div class="card-actions">
              @if (cls.id !== classroomService.activeClassroom().id) {
                <button
                  type="button"
                  class="btn btn-secondary btn-sm flex-1"
                  (click)="setActiveClassroom(cls)"
                >
                  Set as Active
                </button>
              }
              <button
                type="button"
                class="btn btn-primary btn-sm flex-1"
                (click)="launchClassroom(cls)"
              >
                <app-icon name="radio" [size]="14"></app-icon>
                {{ cls.isLive ? 'Enter Live' : 'Start Session' }}
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state card">
            <app-icon name="book-open" [size]="48" customClass="text-slate-300"></app-icon>
            <h3>No classrooms created yet</h3>
            <p>Create your first classroom to begin live polls, quizzes, and lectures.</p>
            <button type="button" class="btn btn-primary" (click)="openCreateModal()">
              <app-icon name="plus" [size]="16"></app-icon>
              Create Classroom
            </button>
          </div>
        }
      </div>
    </div>

    <!-- Create Classroom Modal -->
    <app-modal
      [isOpen]="isCreateModalOpen"
      title="Create New Classroom"
      subtitle="Register a new lecture course or lab room with an auto-generated student PIN"
      maxWidth="540px"
      (closeEvent)="closeCreateModal()"
    >
      <div modal-body>
        <div class="form-group">
          <label class="form-label form-label-required">Classroom / Course Name</label>
          <input
            type="text"
            [(ngModel)]="newClass.name"
            class="form-control"
            placeholder="e.g. Distributed Cloud Computing"
            autofocus
          />
        </div>

        <div class="form-row" style="display: flex; gap: 0.75rem; margin-top: 1rem;">
          <div class="form-group flex-1">
            <label class="form-label form-label-required">Course Code</label>
            <input
              type="text"
              [(ngModel)]="newClass.courseCode"
              class="form-control"
              placeholder="e.g. CS402"
            />
          </div>

          <div class="form-group flex-1">
            <label class="form-label">Custom Room PIN (Optional)</label>
            <input
              type="text"
              [(ngModel)]="newClass.roomCode"
              class="form-control"
              placeholder="e.g. CC402A"
              maxlength="6"
            />
          </div>
        </div>

        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Schedule & Timings</label>
          <input
            type="text"
            [(ngModel)]="newClass.schedule"
            class="form-control"
            placeholder="e.g. Mon, Wed, Fri • 10:00 AM - 11:30 AM"
          />
        </div>

        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Room Location / Venue</label>
          <input
            type="text"
            [(ngModel)]="newClass.roomLocation"
            class="form-control"
            placeholder="e.g. Auditorium Hall B & Virtual"
          />
        </div>
      </div>

      <div modal-footer>
        <button type="button" class="btn btn-secondary btn-sm" (click)="closeCreateModal()">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" (click)="saveClassroom()">
          <app-icon name="plus" [size]="14"></app-icon>
          Create Classroom
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .classrooms-page-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.625rem;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--slate-500);
      margin-top: 0.25rem;
    }
    .stats-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .stat-pill {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 0.875rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      flex: 1;
      min-width: 180px;
    }
    .stat-pill-num {
      display: block;
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--slate-900);
      line-height: 1.1;
    }
    .stat-pill-label {
      font-size: 0.75rem;
      color: var(--slate-500);
      font-weight: 600;
    }
    .classrooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .classroom-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-2xl);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      transition: all 0.2s;
    }
    .classroom-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .classroom-card.card-active {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 1px var(--primary-500), var(--shadow-sm);
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .card-badge-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .btn-delete-icon {
      background: transparent;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      transition: all 0.15s;
    }
    .btn-delete-icon:hover {
      color: var(--accent-rose);
      background-color: #fee2e2;
    }
    .classroom-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--slate-900);
      margin-bottom: 0.35rem;
    }
    .course-code-pill {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary-600);
      background-color: var(--primary-50);
      display: inline-block;
      align-self: flex-start;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
    }
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      font-size: 0.8125rem;
    }
    .info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .info-label {
      color: var(--slate-400);
      font-weight: 600;
    }
    .info-val {
      color: var(--slate-700);
      font-weight: 600;
      text-align: right;
    }
    .pin-box {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background-color: var(--slate-100);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .pin-code {
      font-family: monospace;
      color: var(--primary-700);
      font-weight: 800;
      letter-spacing: 0.05em;
    }
    .btn-copy-pin {
      background: transparent;
      border: none;
      color: var(--slate-500);
      cursor: pointer;
      padding: 0.1rem;
      display: flex;
      align-items: center;
    }
    .btn-copy-pin:hover {
      color: var(--primary-600);
    }
    .card-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .empty-state {
      grid-column: 1 / -1;
      padding: 3rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--slate-900);
    }
    .empty-state p {
      color: var(--slate-500);
      font-size: 0.875rem;
      max-width: 400px;
      margin-bottom: 0.75rem;
    }
  `]
})
export class TeacherClassroomsComponent {
  protected classroomService = inject(ClassroomService);
  private toast = inject(ToastService);
  private router = inject(Router);

  isCreateModalOpen = false;
  newClass = {
    name: '',
    subject: '',
    courseCode: '',
    roomCode: '',
    schedule: 'Mon, Wed, Fri • 10:00 AM - 11:30 AM',
    roomLocation: 'Auditorium Hall B & Virtual'
  };

  get activeLiveCount(): number {
    return this.classroomService.classrooms().filter(c => c.isLive).length;
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  copyPin(pin: string): void {
    navigator.clipboard?.writeText(pin).catch(() => {});
    this.toast.success(`PIN "${pin}" copied to clipboard! Share it with students.`, 'PIN Copied');
  }

  setActiveClassroom(cls: any): void {
    this.classroomService.activeClassroom.set(cls);
    this.toast.info(`Active classroom switched to ${cls.name} (${cls.courseCode})`, 'Classroom Switched');
  }

  launchClassroom(cls: any): void {
    this.classroomService.activeClassroom.set(cls);
    this.router.navigate(['/teacher/live-classroom']);
  }

  saveClassroom(): void {
    if (!this.newClass.name?.trim()) {
      this.toast.warning('Please enter a Classroom / Course Name.');
      return;
    }
    if (!this.newClass.courseCode?.trim()) {
      this.toast.warning('Please enter a Course Code (e.g. CS402).');
      return;
    }

    const created = this.classroomService.createClassroom({
      name: this.newClass.name.trim(),
      subject: this.newClass.subject?.trim() || this.newClass.name.trim(),
      courseCode: this.newClass.courseCode.trim().toUpperCase(),
      roomCode: this.newClass.roomCode?.trim() ? this.newClass.roomCode.trim().toUpperCase() : undefined,
      schedule: this.newClass.schedule?.trim() || 'Mon, Wed, Fri • 10:00 AM - 11:30 AM',
      roomLocation: this.newClass.roomLocation?.trim() || 'Auditorium Hall B & Virtual'
    });

    this.closeCreateModal();
    this.newClass = {
      name: '',
      subject: '',
      courseCode: '',
      roomCode: '',
      schedule: 'Mon, Wed, Fri • 10:00 AM - 11:30 AM',
      roomLocation: 'Auditorium Hall B & Virtual'
    };
  }

  deleteClass(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete classroom "${name}"?`)) {
      this.classroomService.deleteClassroom(id);
    }
  }
}
