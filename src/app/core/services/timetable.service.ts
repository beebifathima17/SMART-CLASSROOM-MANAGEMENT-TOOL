import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';

export interface TimetableSlot {
  id: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string;
  startTime: string;
  endTime: string;
  room: string;
  section: string;
  semester: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
  colorTag: 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose';
  status: 'scheduled' | 'ongoing' | 'rescheduled' | 'cancelled';
  updateNote?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ScheduleNotification {
  id: string;
  title: string;
  message: string;
  type: 'update' | 'reschedule' | 'cancel' | 'conflict';
  timestamp: string;
  read: boolean;
  slotId?: string;
}

export interface ConflictAlert {
  type: 'room' | 'faculty' | 'section';
  message: string;
  conflictingSlot: TimetableSlot;
}

const DEFAULT_SLOTS: TimetableSlot[] = [
  {
    id: 'slot-mon-1',
    courseCode: 'WT04',
    courseName: 'Web Technologies (HTML5/Angular/Node)',
    facultyId: 'usr-teacher-01',
    facultyName: 'Dr. Priya Sharma',
    day: 'Monday',
    timeSlot: '09:00 AM - 10:00 AM',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Lecture Hall 1',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'indigo',
    status: 'scheduled'
  },
  {
    id: 'slot-mon-2',
    courseCode: 'DS02',
    courseName: 'Database Management Systems',
    facultyId: 'usr-fac-02',
    facultyName: 'Prof. Rajesh Kumar',
    day: 'Monday',
    timeSlot: '10:00 AM - 11:00 AM',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    room: 'Room 302',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'emerald',
    status: 'scheduled'
  },
  {
    id: 'slot-mon-3',
    courseCode: 'WT04-LAB',
    courseName: 'Web Technologies Lab Practical',
    facultyId: 'usr-teacher-01',
    facultyName: 'Dr. Priya Sharma',
    day: 'Monday',
    timeSlot: '11:15 AM - 01:15 PM',
    startTime: '11:15 AM',
    endTime: '01:15 PM',
    room: 'Web Lab 2',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lab',
    colorTag: 'purple',
    status: 'scheduled'
  },
  {
    id: 'slot-mon-4',
    courseCode: 'OS03',
    courseName: 'Operating Systems & Concurrency',
    facultyId: 'usr-fac-03',
    facultyName: 'Dr. Anita Desai',
    day: 'Monday',
    timeSlot: '02:00 PM - 03:00 PM',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    room: 'Lecture Hall 1',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'amber',
    status: 'scheduled'
  },
  {
    id: 'slot-tue-1',
    courseCode: 'ML05',
    courseName: 'Machine Learning Fundamentals',
    facultyId: 'usr-fac-04',
    facultyName: 'Prof. Vikram Mehta',
    day: 'Tuesday',
    timeSlot: '09:00 AM - 10:00 AM',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Room 401',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'rose',
    status: 'scheduled'
  },
  {
    id: 'slot-tue-2',
    courseCode: 'WT04',
    courseName: 'Web Technologies (REST & Sockets)',
    facultyId: 'usr-teacher-01',
    facultyName: 'Dr. Priya Sharma',
    day: 'Tuesday',
    timeSlot: '10:00 AM - 11:00 AM',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    room: 'Lecture Hall 1',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'indigo',
    status: 'ongoing'
  },
  {
    id: 'slot-tue-3',
    courseCode: 'CN01',
    courseName: 'Computer Networks & TCP/IP',
    facultyId: 'usr-fac-05',
    facultyName: 'Prof. S. Sen',
    day: 'Tuesday',
    timeSlot: '11:15 AM - 12:15 PM',
    startTime: '11:15 AM',
    endTime: '12:15 PM',
    room: 'Room 302',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'emerald',
    status: 'rescheduled',
    updateNote: 'Shifted from Room 201 due to projector calibration'
  },
  {
    id: 'slot-wed-1',
    courseCode: 'DS02',
    courseName: 'Database Management Systems',
    facultyId: 'usr-fac-02',
    facultyName: 'Prof. Rajesh Kumar',
    day: 'Wednesday',
    timeSlot: '09:00 AM - 10:00 AM',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Room 302',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'emerald',
    status: 'scheduled'
  },
  {
    id: 'slot-wed-2',
    courseCode: 'WT04',
    courseName: 'Web Technologies (Full-Stack MongoDB & Angular)',
    facultyId: 'usr-teacher-01',
    facultyName: 'Dr. Priya Sharma',
    day: 'Wednesday',
    timeSlot: '10:00 AM - 11:00 AM',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    room: 'Lecture Hall 1',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'indigo',
    status: 'scheduled'
  },
  {
    id: 'slot-thu-1',
    courseCode: 'WT04',
    courseName: 'Web Technologies (Tutorial & Project Q/A)',
    facultyId: 'usr-teacher-01',
    facultyName: 'Dr. Priya Sharma',
    day: 'Thursday',
    timeSlot: '10:00 AM - 11:00 AM',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    room: 'Room 105',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Tutorial',
    colorTag: 'indigo',
    status: 'scheduled'
  },
  {
    id: 'slot-fri-1',
    courseCode: 'WT04',
    courseName: 'Web Technologies (Deployment & Performance)',
    facultyId: 'usr-teacher-01',
    facultyName: 'Dr. Priya Sharma',
    day: 'Friday',
    timeSlot: '09:00 AM - 10:00 AM',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Lecture Hall 1',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'indigo',
    status: 'scheduled'
  },
  {
    id: 'slot-fri-2',
    courseCode: 'OS03',
    courseName: 'Operating Systems (Processes & Memory)',
    facultyId: 'usr-fac-03',
    facultyName: 'Dr. Anita Desai',
    day: 'Friday',
    timeSlot: '10:00 AM - 11:00 AM',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    room: 'Lecture Hall 1',
    section: 'CSE-A',
    semester: 'Semester 5',
    type: 'Lecture',
    colorTag: 'amber',
    status: 'scheduled'
  }
];

const DEFAULT_NOTIFICATIONS: ScheduleNotification[] = [
  {
    id: 'notif-1',
    title: 'Timetable Rescheduled',
    message: 'Computer Networks (CN01) on Tuesday 11:15 AM moved to Room 302.',
    type: 'reschedule',
    timestamp: '10 mins ago',
    read: false,
    slotId: 'slot-tue-3'
  },
  {
    id: 'notif-2',
    title: 'Conflict Verification Passed',
    message: 'Automated conflict scan completed: 0 room or faculty conflicts detected across CSE-A.',
    type: 'conflict',
    timestamp: '1 hour ago',
    read: true
  },
  {
    id: 'notif-3',
    title: 'Web Technologies Lab Update',
    message: 'Monday 11:15 AM Lab confirmed in Web Lab 2 with Dr. Priya Sharma.',
    type: 'update',
    timestamp: 'Today, 08:30 AM',
    read: true,
    slotId: 'slot-mon-3'
  }
];

@Injectable({
  providedIn: 'root'
})
export class TimetableService {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  private slotsSignal = signal<TimetableSlot[]>(this.loadStoredSlots());
  private notificationsSignal = signal<ScheduleNotification[]>(this.loadStoredNotifications());
  public selectedDay = signal<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  public selectedSection = signal<string>('All Sections');

  public readonly slots = this.slotsSignal.asReadonly();
  public readonly notifications = this.notificationsSignal.asReadonly();

  // Computed conflicts across active slots
  public readonly conflicts = computed(() => {
    const list = this.slotsSignal();
    const detected: { slot: TimetableSlot; conflicts: ConflictAlert[] }[] = [];

    for (const s of list) {
      if (s.status === 'cancelled') continue;
      const c = this.checkConflict(s, s.id);
      if (c.length > 0) {
        detected.push({ slot: s, conflicts: c });
      }
    }
    return detected;
  });

  // Filtered slots for current view
  public readonly filteredSlots = computed(() => {
    const day = this.selectedDay();
    const section = this.selectedSection();
    return this.slotsSignal().filter(s => {
      const matchDay = s.day === day;
      const matchSection = section === 'All Sections' || s.section === section;
      return matchDay && matchSection;
    });
  });

  // Today's classes for Teacher or Student Dashboard
  public readonly todaySlots = computed(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()] as any;
    const targetDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(todayName)
      ? todayName
      : 'Monday'; // Default to Monday on weekends for preview

    return this.slotsSignal().filter(s => s.day === targetDay && s.status !== 'cancelled');
  });

  // Active ongoing slot right now
  public readonly activeSlot = computed(() => {
    const today = this.todaySlots();
    return today.find(s => s.status === 'ongoing') || today[0] || null;
  });

  constructor() {
    this.syncFromBackend();
  }

  private loadStoredSlots(): TimetableSlot[] {
    const stored = localStorage.getItem('smartclass_timetable_slots');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return DEFAULT_SLOTS;
  }

  private loadStoredNotifications(): ScheduleNotification[] {
    const stored = localStorage.getItem('smartclass_timetable_notifs');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return DEFAULT_NOTIFICATIONS;
  }

  private saveToStorage(): void {
    localStorage.setItem('smartclass_timetable_slots', JSON.stringify(this.slotsSignal()));
    localStorage.setItem('smartclass_timetable_notifs', JSON.stringify(this.notificationsSignal()));
  }

  public syncFromBackend(): void {
    this.api.get<{ success: boolean; data: TimetableSlot[] }>('/timetable').subscribe({
      next: res => {
        if (res && res.success && res.data && res.data.length > 0) {
          this.slotsSignal.set(res.data);
          this.saveToStorage();
        }
      },
      error: () => {
        // Fallback gracefully on local storage
      }
    });

    this.api.get<{ success: boolean; data: ScheduleNotification[] }>('/timetable/notifications').subscribe({
      next: res => {
        if (res && res.success && res.data && res.data.length > 0) {
          this.notificationsSignal.set(res.data);
          this.saveToStorage();
        }
      },
      error: () => {}
    });
  }

  public checkConflict(candidate: Partial<TimetableSlot>, excludeId?: string): ConflictAlert[] {
    const all = this.slotsSignal();
    const conflicts: ConflictAlert[] = [];

    for (const slot of all) {
      if (excludeId && slot.id === excludeId) continue;
      if (slot.status === 'cancelled') continue;

      if (slot.day === candidate.day) {
        const timeOverlap =
          slot.timeSlot === candidate.timeSlot ||
          (slot.startTime === candidate.startTime && slot.endTime === candidate.endTime);

        if (timeOverlap) {
          // Room collision
          if (candidate.room && slot.room.trim().toLowerCase() === candidate.room.trim().toLowerCase()) {
            conflicts.push({
              type: 'room',
              message: `Room Collision: '${slot.room}' is already booked for ${slot.courseCode} (${slot.courseName}) with ${slot.facultyName} on ${slot.day} at ${slot.timeSlot}.`,
              conflictingSlot: slot
            });
          }

          // Faculty collision
          if (
            candidate.facultyName &&
            slot.facultyName.trim().toLowerCase() === candidate.facultyName.trim().toLowerCase()
          ) {
            conflicts.push({
              type: 'faculty',
              message: `Faculty Overlap: ${slot.facultyName} is already assigned to teach ${slot.courseCode} during this slot.`,
              conflictingSlot: slot
            });
          }

          // Section collision
          if (candidate.section && slot.section === candidate.section) {
            conflicts.push({
              type: 'section',
              message: `Section Overlap: Section '${slot.section}' already has ${slot.courseCode} scheduled.`,
              conflictingSlot: slot
            });
          }
        }
      }
    }
    return conflicts;
  }

  public addSlot(slot: Omit<TimetableSlot, 'id'>, force: boolean = false): boolean {
    const conflicts = this.checkConflict(slot);
    if (conflicts.length > 0 && !force) {
      this.toast.error(conflicts[0].message, 'Schedule Conflict Detected');
      return false;
    }

    const newSlot: TimetableSlot = {
      ...slot,
      id: `slot-${Date.now().toString(36)}`,
      updatedAt: new Date().toISOString()
    };

    this.slotsSignal.update(slots => [...slots, newSlot]);

    const notif: ScheduleNotification = {
      id: `notif-${Date.now()}`,
      title: 'Class Added to Timetable',
      message: `${newSlot.courseCode} added on ${newSlot.day} (${newSlot.timeSlot}) in ${newSlot.room}.`,
      type: 'update',
      timestamp: 'Just now',
      read: false,
      slotId: newSlot.id
    };
    this.notificationsSignal.update(list => [notif, ...list]);
    this.saveToStorage();

    // Call backend API in background
    this.api.post('/timetable', { ...newSlot, force }).subscribe({
      next: () => {},
      error: () => {}
    });

    this.toast.success(`Slot for ${newSlot.courseCode} saved to timetable!`);
    return true;
  }

  public updateSlot(id: string, updates: Partial<TimetableSlot>, force: boolean = false): boolean {
    const existing = this.slotsSignal().find(s => s.id === id);
    if (!existing) return false;

    const merged = { ...existing, ...updates };
    const conflicts = this.checkConflict(merged, id);

    if (conflicts.length > 0 && !force) {
      this.toast.error(conflicts[0].message, 'Conflict Collision Detected');
      return false;
    }

    this.slotsSignal.update(slots =>
      slots.map(s => {
        if (s.id === id) {
          return {
            ...merged,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );

    const notifType = updates.status === 'cancelled' ? 'cancel' : (updates.status === 'rescheduled' ? 'reschedule' : 'update');
    const noteSuffix = updates.updateNote ? ` (${updates.updateNote})` : '';

    const notif: ScheduleNotification = {
      id: `notif-${Date.now()}`,
      title: updates.status === 'cancelled' ? 'Lecture Cancelled' : 'Timetable Update',
      message: `${existing.courseCode} on ${merged.day} at ${merged.timeSlot} updated to ${merged.room}.${noteSuffix}`,
      type: notifType,
      timestamp: 'Just now',
      read: false,
      slotId: id
    };
    this.notificationsSignal.update(list => [notif, ...list]);
    this.saveToStorage();

    // Backend sync
    this.api.put(`/timetable/${id}`, { ...updates, force }).subscribe({
      next: () => {},
      error: () => {}
    });

    this.toast.success(`Timetable slot for ${existing.courseCode} updated!`);
    return true;
  }

  public deleteSlot(id: string): void {
    const slot = this.slotsSignal().find(s => s.id === id);
    this.slotsSignal.update(slots => slots.filter(s => s.id !== id));

    if (slot) {
      const notif: ScheduleNotification = {
        id: `notif-${Date.now()}`,
        title: 'Class Slot Removed',
        message: `${slot.courseCode} (${slot.courseName}) on ${slot.day} ${slot.timeSlot} was removed from the schedule.`,
        type: 'cancel',
        timestamp: 'Just now',
        read: false
      };
      this.notificationsSignal.update(list => [notif, ...list]);
    }

    this.saveToStorage();
    this.api.delete(`/timetable/${id}`).subscribe({ next: () => {}, error: () => {} });
    this.toast.info('Timetable slot removed.');
  }

  public markNotificationsRead(): void {
    this.notificationsSignal.update(list => list.map(n => ({ ...n, read: true })));
    this.saveToStorage();
    this.api.post('/timetable/notifications/mark-read', {}).subscribe({ next: () => {}, error: () => {} });
  }
}
