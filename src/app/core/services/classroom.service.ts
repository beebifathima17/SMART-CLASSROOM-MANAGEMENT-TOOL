import { Injectable, signal, computed } from '@angular/core';
import { Classroom, ClassroomSession, EnrolledStudent, ActivityFeedItem, JoinRequest } from '../models/classroom.model';
import { ToastService } from './toast.service';

export const DEFAULT_CLASSROOMS: Classroom[] = [
  {
    id: 'cls-wt-301',
    name: 'Web Technologies',
    subject: 'Web Technologies',
    courseCode: 'WT301',
    roomCode: 'WT7K92',
    teacherId: 'tea-inst-01',
    teacherName: 'Course Instructor',
    institution: 'National Institute of Technology',
    totalEnrolled: 0,
    activeStudentsCount: 0,
    isLive: false,
    startedAt: '10:00 AM',
    schedule: 'Mon, Wed, Fri • 10:00 AM - 11:30 AM',
    roomLocation: 'Auditorium Hall B & Virtual'
  },
  {
    id: 'cls-dbms-302',
    name: 'Database Management Systems',
    subject: 'DBMS',
    courseCode: 'CS302',
    roomCode: 'DB4M88',
    teacherId: 'tea-inst-01',
    teacherName: 'Course Instructor',
    institution: 'National Institute of Technology',
    totalEnrolled: 0,
    activeStudentsCount: 0,
    isLive: false,
    schedule: 'Tue, Thu • 02:00 PM - 03:30 PM',
    roomLocation: 'Lab 4 & Virtual'
  },
  {
    id: 'cls-cloud-401',
    name: 'Cloud Computing & Distributed Systems',
    subject: 'Cloud Computing',
    courseCode: 'CS401',
    roomCode: 'CC9X14',
    teacherId: 'tea-inst-01',
    teacherName: 'Course Instructor',
    institution: 'National Institute of Technology',
    totalEnrolled: 0,
    activeStudentsCount: 0,
    isLive: false,
    schedule: 'Wed, Fri • 03:30 PM - 05:00 PM',
    roomLocation: 'Seminar Hall 1'
  }
];

export const DEFAULT_STUDENTS: EnrolledStudent[] = [];

export const DEFAULT_FEED: ActivityFeedItem[] = [];

export const DEFAULT_SESSIONS: ClassroomSession[] = [];


@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private classroomsSignal = signal<Classroom[]>([]);
  private studentsSignal = signal<EnrolledStudent[]>([]);
  private sessionsSignal = signal<ClassroomSession[]>([]);
  private activityFeedSignal = signal<ActivityFeedItem[]>([]);
  private joinRequestsSignal = signal<JoinRequest[]>([]);
  private handRaisesSignal = signal<{ id: string; studentId: string; studentName: string; question?: string; timestamp: string }[]>([]);

  public readonly classrooms = this.classroomsSignal.asReadonly();
  public readonly activeClassroom = signal<Classroom>(DEFAULT_CLASSROOMS[0]);
  public readonly liveStudents = this.studentsSignal.asReadonly();
  public readonly sessions = this.sessionsSignal.asReadonly();
  public readonly activityFeed = this.activityFeedSignal.asReadonly();
  public readonly joinRequests = this.joinRequestsSignal.asReadonly();
  public readonly handRaises = this.handRaisesSignal.asReadonly();
  public readonly pendingJoinRequests = computed(() =>
    this.joinRequestsSignal().filter(r => r.status === 'pending')
  );

  constructor(private toast: ToastService) {
    this.initStorage();
    this.listenToStorage();
  }

  private isDemoStudent(s: any): boolean {
    if (!s) return false;
    const email = (s.email || '').toLowerCase();
    const id = s.id || '';
    const name = (s.name || '').toLowerCase();
    return (
      id === 'stu-01' ||
      id === 'stu-02' ||
      id === 'stu-03' ||
      id === 'stu-04' ||
      id === 'stu-05' ||
      id === 'stu-06' ||
      email.includes('@student.nit.edu') ||
      name.includes('aisha') ||
      name.includes('rahul') ||
      name.includes('sarah') ||
      name.includes('arjun') ||
      name.includes('meera') ||
      name.includes('vikram')
    );
  }

  private initStorage(): void {
    // Students
    const storedStudents = localStorage.getItem('smartclass_students');
    let cleanStudents: EnrolledStudent[] = [];
    if (storedStudents) {
      try {
        const parsed = JSON.parse(storedStudents);
        if (Array.isArray(parsed)) {
          cleanStudents = parsed.filter(s => !this.isDemoStudent(s));
        }
      } catch (e) {
        cleanStudents = [];
      }
    }
    this.studentsSignal.set(cleanStudents);
    localStorage.setItem('smartclass_students', JSON.stringify(cleanStudents));

    // Classrooms
    const storedCls = localStorage.getItem('smartclass_classrooms');
    if (storedCls) {
      try {
        const parsed: Classroom[] = JSON.parse(storedCls);
        const cleaned = parsed.map(c => ({
          ...c,
          totalEnrolled: cleanStudents.length,
          activeStudentsCount: c.isLive ? cleanStudents.length : 0
        }));
        this.classroomsSignal.set(cleaned);
        this.activeClassroom.set(cleaned[0] || DEFAULT_CLASSROOMS[0]);
      } catch (e) {
        this.resetClassrooms();
      }
    } else {
      this.resetClassrooms();
    }

    // Sessions
    const storedSessions = localStorage.getItem('smartclass_sessions');
    let cleanSessions: ClassroomSession[] = [];
    if (storedSessions) {
      try {
        const parsed = JSON.parse(storedSessions);
        if (Array.isArray(parsed)) {
          cleanSessions = parsed.filter(s => s.id !== 'sess-12' && s.id !== 'sess-11' && s.totalEnrolledCount !== 48);
        }
      } catch (e) {
        cleanSessions = [];
      }
    }
    this.sessionsSignal.set(cleanSessions);
    localStorage.setItem('smartclass_sessions', JSON.stringify(cleanSessions));

    // Join Requests
    const storedReqs = localStorage.getItem('smartclass_join_requests');
    if (storedReqs) {
      try {
        this.joinRequestsSignal.set(JSON.parse(storedReqs));
      } catch (e) {
        this.joinRequestsSignal.set([]);
      }
    } else {
      this.joinRequestsSignal.set([]);
    }

    // Feed
    this.activityFeedSignal.set(DEFAULT_FEED);
  }

  private resetClassrooms(): void {
    this.classroomsSignal.set(DEFAULT_CLASSROOMS);
    this.activeClassroom.set(DEFAULT_CLASSROOMS[0]);
    localStorage.setItem('smartclass_classrooms', JSON.stringify(DEFAULT_CLASSROOMS));
  }

  private listenToStorage(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'smartclass_classrooms' && event.newValue) {
        try {
          const clsList = JSON.parse(event.newValue);
          this.classroomsSignal.set(clsList);
        } catch (e) {}
      }
      if (event.key === 'smartclass_students' && event.newValue) {
        try {
          const list = JSON.parse(event.newValue);
          this.studentsSignal.set(Array.isArray(list) ? list.filter(s => !this.isDemoStudent(s)) : []);
        } catch (e) {}
      }
      if (event.key === 'smartclass_join_requests' && event.newValue) {
        try {
          this.joinRequestsSignal.set(JSON.parse(event.newValue));
        } catch (e) {}
      }
    });
  }

  createClassroom(data: { name: string; subject: string; courseCode: string; roomCode?: string; schedule?: string; roomLocation?: string }): Classroom {
    const generatedCode = (data.roomCode || Math.random().toString(36).substring(2, 8)).toUpperCase();
    const newClass: Classroom = {
      id: `cls-${Date.now()}`,
      name: data.name.trim(),
      subject: data.subject.trim(),
      courseCode: data.courseCode.trim().toUpperCase(),
      roomCode: generatedCode,
      teacherId: 'tea-inst-01',
      teacherName: 'Faculty Instructor',
      institution: 'National Institute of Technology',
      totalEnrolled: this.studentsSignal().length,
      activeStudentsCount: 0,
      isLive: false,
      schedule: data.schedule || 'Scheduled Classes',
      roomLocation: data.roomLocation || 'Auditorium & Virtual'
    };

    const updated = [newClass, ...this.classroomsSignal()];
    this.classroomsSignal.set(updated);
    this.activeClassroom.set(newClass);
    localStorage.setItem('smartclass_classrooms', JSON.stringify(updated));

    this.toast.success(`Created classroom "${newClass.name}" with Room Code: ${newClass.roomCode}!`, 'Classroom Created');
    return newClass;
  }

  deleteClassroom(classroomId: string): void {
    const list = this.classroomsSignal().filter(c => c.id !== classroomId);
    this.classroomsSignal.set(list);
    localStorage.setItem('smartclass_classrooms', JSON.stringify(list));

    if (this.activeClassroom().id === classroomId) {
      if (list.length > 0) {
        this.activeClassroom.set(list[0]);
      } else {
        const fallback: Classroom = {
          id: `cls-${Date.now()}`,
          name: 'General Classroom',
          subject: 'General Subject',
          courseCode: 'GEN101',
          roomCode: 'GEN99',
          teacherId: 'tea-inst-01',
          teacherName: 'Faculty Instructor',
          institution: 'National Institute of Technology',
          totalEnrolled: 0,
          activeStudentsCount: 0,
          isLive: false,
          schedule: 'Scheduled',
          roomLocation: 'Lecture Hall 1'
        };
        this.classroomsSignal.set([fallback]);
        this.activeClassroom.set(fallback);
        localStorage.setItem('smartclass_classrooms', JSON.stringify([fallback]));
      }
    }
    this.toast.info('Classroom deleted successfully.', 'Classroom Deleted');
  }

  addStudentToRoster(name: string, email: string): EnrolledStudent {
    const newStudent: EnrolledStudent = {
      id: `stu-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      status: 'active',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      sessionsAttended: 1,
      totalSessions: 1,
      pollsAnswered: 0,
      totalPolls: 1,
      quizzesCompleted: 0,
      quizAverage: 0,
      participationPercentage: 100,
      lastActive: 'Just now'
    };

    const updated = [newStudent, ...this.studentsSignal()];
    this.studentsSignal.set(updated);
    localStorage.setItem('smartclass_students', JSON.stringify(updated));

    // Update classroom count
    const currentCls = this.activeClassroom();
    const updatedCls: Classroom = {
      ...currentCls,
      totalEnrolled: currentCls.totalEnrolled + 1,
      activeStudentsCount: currentCls.activeStudentsCount + 1
    };
    this.activeClassroom.set(updatedCls);

    this.addActivityFeedItem({
      type: 'student_joined',
      message: `${newStudent.name} enrolled in ${currentCls.courseCode}`,
      studentName: newStudent.name,
      badgeType: 'info'
    });

    this.toast.success(`Student ${newStudent.name} added to roster!`, 'Student Added');
    return newStudent;
  }

  getClassroomByCode(code: string): Classroom | undefined {
    return this.classroomsSignal().find(
      c => c.roomCode.toUpperCase().trim() === code.trim().toUpperCase()
    );
  }

  joinClassroomByCode(code: string, studentName: string): boolean {
    const classroom = this.getClassroomByCode(code);
    if (!classroom) {
      this.toast.error(`No classroom found with PIN "${code}". Try WT7K92.`, 'Invalid Code');
      return false;
    }

    this.activeClassroom.set(classroom);

    // Check if student is in roster
    const exists = this.studentsSignal().find(s => s.name.toLowerCase() === studentName.toLowerCase());
    if (!exists) {
      this.addStudentToRoster(studentName, `${studentName.toLowerCase().replace(/\s+/g, '.')}@student.nit.edu`);
    }

    this.addActivityFeedItem({
      type: 'student_joined',
      message: `${studentName} connected to ${classroom.courseCode}`,
      studentName,
      badgeType: 'info'
    });
    this.toast.success(`Connected to ${classroom.name} (${classroom.courseCode})!`, 'Room Joined');
    return true;
  }

  requestJoinClassroom(
    student: { id: string; name: string; email: string },
    roomCode: string
  ): { status: 'approved' | 'pending' | 'rejected' | 'not_found'; classroom?: Classroom; request?: JoinRequest } {
    const classroom = this.getClassroomByCode(roomCode);
    if (!classroom) {
      this.toast.error(`No classroom found with PIN "${roomCode}".`, 'Invalid Code');
      return { status: 'not_found' };
    }

    // Check if student is already in roster
    const inRoster = this.studentsSignal().find(
      s => s.id === student.id || s.email.toLowerCase() === student.email.toLowerCase()
    );
    if (inRoster) {
      this.activeClassroom.set(classroom);
      return { status: 'approved', classroom };
    }

    // Check if there is an existing join request
    const existingReq = this.joinRequestsSignal().find(
      r => r.classroomId === classroom.id && (r.studentId === student.id || r.studentEmail.toLowerCase() === student.email.toLowerCase())
    );

    if (existingReq) {
      if (existingReq.status === 'approved') {
        this.activeClassroom.set(classroom);
        return { status: 'approved', classroom, request: existingReq };
      }
      return { status: existingReq.status, classroom, request: existingReq };
    }

    // Create new pending join request
    const newRequest: JoinRequest = {
      id: `req-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      roomCode: classroom.roomCode,
      classroomId: classroom.id,
      classroomName: classroom.name,
      requestedAt: 'Just now',
      status: 'pending'
    };

    const updatedRequests = [newRequest, ...this.joinRequestsSignal()];
    this.joinRequestsSignal.set(updatedRequests);
    localStorage.setItem('smartclass_join_requests', JSON.stringify(updatedRequests));

    this.addActivityFeedItem({
      type: 'student_joined',
      message: `${student.name} requested to join ${classroom.courseCode}`,
      studentName: student.name,
      badgeType: 'warning'
    });

    this.toast.info(`Join request sent to instructor for ${classroom.name}. Please wait for approval.`, 'Request Sent');
    return { status: 'pending', classroom, request: newRequest };
  }

  approveJoinRequest(requestId: string): void {
    const req = this.joinRequestsSignal().find(r => r.id === requestId);
    if (!req) return;

    const updatedRequests = this.joinRequestsSignal().map(r =>
      r.id === requestId ? { ...r, status: 'approved' as const } : r
    );
    this.joinRequestsSignal.set(updatedRequests);
    localStorage.setItem('smartclass_join_requests', JSON.stringify(updatedRequests));

    // Enroll student in roster
    this.addStudentToRoster(req.studentName, req.studentEmail);

    this.toast.success(`Admitted ${req.studentName} into classroom!`, 'Student Admitted');
  }

  rejectJoinRequest(requestId: string): void {
    const req = this.joinRequestsSignal().find(r => r.id === requestId);
    if (!req) return;

    const updatedRequests = this.joinRequestsSignal().map(r =>
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    );
    this.joinRequestsSignal.set(updatedRequests);
    localStorage.setItem('smartclass_join_requests', JSON.stringify(updatedRequests));

    this.toast.info(`Declined admission for ${req.studentName}.`, 'Request Declined');
  }

  admitAllPendingRequests(): void {
    const pendings = this.pendingJoinRequests();
    if (pendings.length === 0) return;

    pendings.forEach(req => {
      this.approveJoinRequest(req.id);
    });
    this.toast.success(`Admitted all ${pendings.length} students into class!`, 'All Admitted');
  }

  getStudentRequestStatus(studentId: string, roomCode: string): 'none' | 'pending' | 'approved' | 'rejected' {
    const classroom = this.getClassroomByCode(roomCode);
    if (!classroom) return 'none';

    const inRoster = this.studentsSignal().find(s => s.id === studentId);
    if (inRoster) return 'approved';

    const req = this.joinRequestsSignal().find(
      r => r.classroomId === classroom.id && r.studentId === studentId
    );
    return req ? req.status : 'none';
  }

  addActivityFeedItem(item: Omit<ActivityFeedItem, 'id' | 'timestamp'>): void {
    const newItem: ActivityFeedItem = {
      ...item,
      id: `feed-${Date.now()}`,
      timestamp: 'Just now'
    };
    this.activityFeedSignal.update(feed => [newItem, ...feed.slice(0, 15)]);
  }

  startLiveSession(): void {
    const current = this.activeClassroom();
    const updated: Classroom = {
      ...current,
      isLive: true,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sessionStartEpoch: Date.now(),
      activeStudentsCount: this.studentsSignal().length
    };
    this.activeClassroom.set(updated);
    this.classroomsSignal.update(clsList => {
      const result = clsList.map(c => c.id === current.id ? updated : c);
      localStorage.setItem('smartclass_classrooms', JSON.stringify(result));
      return result;
    });

    this.addActivityFeedItem({
      type: 'poll_response',
      message: `🔴 Live classroom session started for ${current.name} (${current.courseCode})`,
      badgeType: 'primary'
    });
    this.toast.success(`Live session started for ${current.courseCode}. PIN: ${current.roomCode}`, 'Classroom Live');
  }

  endLiveSession(summaryText?: string): void {
    const current = this.activeClassroom();
    const updated: Classroom = {
      ...current,
      isLive: false,
      sessionStartEpoch: undefined,
      activeStudentsCount: 0
    };
    this.activeClassroom.set(updated);
    this.classroomsSignal.update(clsList => {
      const result = clsList.map(c => c.id === current.id ? updated : c);
      localStorage.setItem('smartclass_classrooms', JSON.stringify(result));
      return result;
    });

    // Record session history entry
    const sessionCount = this.sessionsSignal().length + 1;
    const newSession: ClassroomSession = {
      id: `sess-${Date.now()}`,
      sessionNumber: sessionCount,
      title: `${current.name} Session #${sessionCount}`,
      subject: current.subject,
      classroomId: current.id,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      startTime: current.startedAt || '10:00 AM',
      durationMinutes: 45,
      studentsAttendedCount: this.studentsSignal().length,
      totalEnrolledCount: this.studentsSignal().length,
      participationPercentage: this.studentsSignal().length > 0 ? 100 : 0,
      pollsCount: 0,
      quizzesCount: 0,
      status: 'completed',
      summary: summaryText || `Classroom session ended for ${current.name}. Attendance records saved.`
    };

    const updatedSessions = [newSession, ...this.sessionsSignal()];
    this.sessionsSignal.set(updatedSessions);
    localStorage.setItem('smartclass_sessions', JSON.stringify(updatedSessions));

    // Reset student statuses to idle
    this.studentsSignal.update(students => {
      const res = students.map(s => ({ ...s, status: 'idle' as const }));
      localStorage.setItem('smartclass_students', JSON.stringify(res));
      return res;
    });

    this.addActivityFeedItem({
      type: 'feedback_given',
      message: `⏹️ Classroom session ended for ${current.courseCode}. Logged to session history.`,
      badgeType: 'info'
    });
    this.toast.info(`Session ended for ${current.courseCode}. Summary saved.`, 'Session Closed');
  }

  toggleLiveSession(): void {
    if (this.activeClassroom().isLive) {
      this.endLiveSession();
    } else {
      this.startLiveSession();
    }
  }

  updateStudentStatus(studentId: string, status: EnrolledStudent['status']): void {
    this.studentsSignal.update(students => {
      const updated = students.map(s => s.id === studentId ? { ...s, status, lastActive: 'Just now' } : s);
      localStorage.setItem('smartclass_students', JSON.stringify(updated));
      return updated;
    });
  }

  raiseHand(student: { id: string; name: string }, question?: string): void {
    const newRaise = {
      id: `hand-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      question: question || 'Raised hand with a question/doubt',
      timestamp: 'Just now'
    };
    this.handRaisesSignal.update(list => [newRaise, ...list]);
    this.addActivityFeedItem({
      type: 'feedback_given',
      message: `✋ ${student.name} raised hand: "${newRaise.question}"`,
      badgeType: 'warning'
    });
    this.toast.info(`Hand raised! Instructor notified.`, 'Hand Raised');
  }

  acknowledgeHandRaise(id: string): void {
    this.handRaisesSignal.update(list => list.filter(h => h.id !== id));
    this.toast.success('Doubt/Hand-raise acknowledged.', 'Acknowledged');
  }

  clearAllHandRaises(): void {
    this.handRaisesSignal.set([]);
    this.toast.info('Cleared hand raise queue.', 'Queue Cleared');
  }

  clearActivityFeed(): void {
    this.activityFeedSignal.set([]);
    this.toast.info('Activity stream cleared.', 'Feed Cleared');
  }

  deleteActivityItem(id: string): void {
    this.activityFeedSignal.update(feed => feed.filter(f => f.id !== id));
  }
}
