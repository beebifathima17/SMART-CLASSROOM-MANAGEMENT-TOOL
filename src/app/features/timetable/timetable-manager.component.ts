import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TimetableService, TimetableSlot, ConflictAlert } from '../../core/services/timetable.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-timetable-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './timetable-manager.component.html',
  styleUrls: ['./timetable-manager.component.css']
})
export class TimetableManagerComponent {
  protected timetableService = inject(TimetableService);
  protected authService = inject(AuthService);

  // View state: 'grid' or 'day'
  viewMode = signal<'grid' | 'day'>('grid');

  // Days list
  days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  // Standard university time slots
  timeSlots = [
    { start: '09:00 AM', end: '10:00 AM', label: '09:00 AM - 10:00 AM' },
    { start: '10:00 AM', end: '11:00 AM', label: '10:00 AM - 11:00 AM' },
    { start: '11:15 AM', end: '12:15 PM', label: '11:15 AM - 12:15 PM' },
    { start: '12:15 PM', end: '01:15 PM', label: '12:15 PM - 01:15 PM' },
    { start: '02:00 PM', end: '03:00 PM', label: '02:00 PM - 03:00 PM' },
    { start: '03:00 PM', end: '04:00 PM', label: '03:00 PM - 04:00 PM' }
  ];

  sections = ['All Sections', 'CSE-A', 'CSE-B', 'CSE-C'];

  // Modal State
  isModalOpen = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingSlotId = signal<string | null>(null);

  // Form Model
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

  // Real-time conflict state inside modal
  modalConflicts = signal<ConflictAlert[]>([]);
  forceOverride = signal<boolean>(false);

  // Filter query
  searchQuery = signal<string>('');

  // Notifications panel toggle
  showNotifsPanel = signal<boolean>(false);

  get isFacultyOrAdmin(): boolean {
    const role = this.authService.userRole();
    return role === 'teacher' || role === 'admin';
  }

  // Get slot at specific day and time range
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

  // Open modal for new slot
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

    this.isModalOpen.set(true);
  }

  // Open modal for editing slot
  openEditModal(slot: TimetableSlot, event?: Event): void {
    if (event) event.stopPropagation();
    this.isEditMode.set(true);
    this.editingSlotId.set(slot.id);
    this.modalConflicts.set([]);
    this.forceOverride.set(false);

    this.formModel = { ...slot };
    this.isModalOpen.set(true);
  }

  // Validate conflicts live as user alters form fields
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
      return;
    }

    this.formModel.timeSlot = `${this.formModel.startTime} - ${this.formModel.endTime}`;

    if (this.isEditMode() && this.editingSlotId()) {
      const success = this.timetableService.updateSlot(
        this.editingSlotId()!,
        this.formModel,
        this.forceOverride()
      );
      if (success) this.closeModal();
    } else {
      const success = this.timetableService.addSlot(
        this.formModel as any,
        this.forceOverride()
      );
      if (success) this.closeModal();
    }
  }

  deleteSlot(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm('Are you sure you want to remove this timetable slot?')) {
      this.timetableService.deleteSlot(id);
    }
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  selectDay(day: any): void {
    this.timetableService.selectedDay.set(day);
  }

  selectSection(section: string): void {
    this.timetableService.selectedSection.set(section);
  }
}
