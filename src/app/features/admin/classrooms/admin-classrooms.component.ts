import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassroomService } from '../../../core/services/classroom.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-admin-classrooms',
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="admin-classrooms-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Institution Classrooms & Rooms</h1>
          <p class="page-subtitle">Directory of active, scheduled, and archived lecture courses</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreateModal()">
          <app-icon name="plus" [size]="16"></app-icon>
          Create Classroom
        </button>
      </div>

      <div class="card">
        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="table">
            <thead>
              <tr>
                <th>Classroom Course</th>
                <th>Room Code</th>
                <th>Instructor</th>
                <th>Enrolled</th>
                <th>Schedule</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (cls of classroomService.classrooms(); track cls.id) {
                <tr>
                  <td>
                    <strong>{{ cls.name }}</strong>
                    <span class="text-xs text-slate-400 block">{{ cls.courseCode }}</span>
                  </td>
                  <td>
                    <span class="badge badge-indigo font-bold">{{ cls.roomCode }}</span>
                  </td>
                  <td>{{ cls.teacherName }}</td>
                  <td><strong>{{ cls.totalEnrolled }}</strong> students</td>
                  <td>{{ cls.schedule }}</td>
                  <td>{{ cls.roomLocation }}</td>
                  <td>
                    <span
                      class="badge"
                      [ngClass]="cls.isLive ? 'badge-live' : 'badge-draft'"
                    >
                      {{ cls.isLive ? 'Live In Session' : 'Scheduled' }}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-danger btn-sm"
                      (click)="deleteClass(cls.id, cls.name)"
                      title="Delete Classroom"
                    >
                      <app-icon name="trash-2" [size]="14"></app-icon>
                      Delete
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" style="text-align: center; padding: 2rem; color: var(--slate-400);">
                    No classrooms found. Click "Create Classroom" to add one.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Classroom Modal -->
    <app-modal
      [isOpen]="isCreateModalOpen"
      title="Create New Classroom"
      subtitle="Register a new academic lecture room or lab course"
      maxWidth="520px"
      (closeEvent)="closeCreateModal()"
    >
      <div modal-body>
        <div class="form-group">
          <label class="form-label form-label-required">Classroom / Course Name</label>
          <input
            type="text"
            [(ngModel)]="newClass.name"
            class="form-control"
            placeholder="e.g. Artificial Intelligence & Neural Networks"
          />
        </div>

        <div class="form-row" style="display: flex; gap: 0.75rem; margin-top: 1rem;">
          <div class="form-group flex-1">
            <label class="form-label form-label-required">Course Code</label>
            <input
              type="text"
              [(ngModel)]="newClass.courseCode"
              class="form-control"
              placeholder="e.g. AI401"
            />
          </div>

          <div class="form-group flex-1">
            <label class="form-label">Custom Room PIN (Optional)</label>
            <input
              type="text"
              [(ngModel)]="newClass.roomCode"
              class="form-control"
              placeholder="e.g. AI902X"
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
            placeholder="e.g. Tue, Thu • 11:00 AM - 12:30 PM"
          />
        </div>

        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Room Location</label>
          <input
            type="text"
            [(ngModel)]="newClass.roomLocation"
            class="form-control"
            placeholder="e.g. CS Lab 2 & Virtual"
          />
        </div>
      </div>

      <div modal-footer>
        <button type="button" class="btn btn-secondary btn-sm" (click)="closeCreateModal()">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" (click)="saveClassroom()">Create Classroom</button>
      </div>
    </app-modal>
  `,
  styles: [`
    .admin-classrooms-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--slate-500);
      margin-top: 0.25rem;
    }
  `]
})
export class AdminClassroomsComponent {
  protected classroomService = inject(ClassroomService);
  private toast = inject(ToastService);

  isCreateModalOpen = false;
  newClass = {
    name: '',
    subject: '',
    courseCode: '',
    roomCode: '',
    schedule: 'Mon, Wed, Fri • 10:00 AM - 11:30 AM',
    roomLocation: 'Lecture Hall 1'
  };

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  saveClassroom(): void {
    if (!this.newClass.name?.trim()) {
      this.toast.warning('Please enter a Classroom Name.');
      return;
    }
    if (!this.newClass.courseCode?.trim()) {
      this.toast.warning('Please enter a Course Code.');
      return;
    }

    this.classroomService.createClassroom({
      name: this.newClass.name.trim(),
      subject: this.newClass.subject?.trim() || this.newClass.name.trim(),
      courseCode: this.newClass.courseCode.trim().toUpperCase(),
      roomCode: this.newClass.roomCode?.trim() ? this.newClass.roomCode.trim().toUpperCase() : undefined,
      schedule: this.newClass.schedule?.trim() || 'Mon, Wed, Fri • 10:00 AM - 11:30 AM',
      roomLocation: this.newClass.roomLocation?.trim() || 'Lecture Hall 1'
    });

    this.closeCreateModal();
    this.newClass = {
      name: '',
      subject: '',
      courseCode: '',
      roomCode: '',
      schedule: 'Mon, Wed, Fri • 10:00 AM - 11:30 AM',
      roomLocation: 'Lecture Hall 1'
    };
  }

  deleteClass(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete classroom "${name}"?`)) {
      this.classroomService.deleteClassroom(id);
    }
  }
}
