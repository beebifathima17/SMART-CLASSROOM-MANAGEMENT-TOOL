export type StudentLiveStatus = 'active' | 'answered' | 'not_responded' | 'idle';

export interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: StudentLiveStatus;
  sessionsAttended: number;
  totalSessions: number;
  pollsAnswered: number;
  totalPolls: number;
  quizzesCompleted: number;
  quizAverage: number;
  participationPercentage: number;
  lastActive: string;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  type: 'poll_response' | 'student_joined' | 'quiz_completed' | 'feedback_given';
  message: string;
  studentName?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'info';
}

export interface ClassroomSession {
  id: string;
  sessionNumber: number;
  title: string;
  subject: string;
  classroomId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  studentsAttendedCount: number;
  totalEnrolledCount: number;
  participationPercentage: number;
  pollsCount: number;
  quizzesCount: number;
  status: 'live' | 'completed' | 'scheduled';
  summary?: string;
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  courseCode: string;
  roomCode: string; // e.g. WT7K92
  teacherId: string;
  teacherName: string;
  institution: string;
  totalEnrolled: number;
  activeStudentsCount: number;
  isLive: boolean;
  currentSessionId?: string;
  currentPollId?: string;
  currentQuizId?: string;
  startedAt?: string;
  sessionStartEpoch?: number;
  schedule: string;
  roomLocation: string;
}

export interface JoinRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomCode: string;
  classroomId: string;
  classroomName: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}
