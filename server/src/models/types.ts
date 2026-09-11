export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  studentId?: string;
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  courseCode: string;
  section?: string;
  teacherId: string;
  teacherName: string;
  roomCode: string; // PIN
  isLive: boolean;
  startedAt?: string;
  schedule?: string;
  roomLocation?: string;
  enrolledStudentsCount?: number;
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  classroomId: string;
  roomCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface ClassroomMember {
  id: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  joinedAt: string;
  isOnline: boolean;
  participationPercentage: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  isCorrect?: boolean;
}

export interface Poll {
  id: string;
  classroomId: string;
  title: string;
  question: string;
  type: 'multiple-choice' | 'yes-no' | 'word-cloud' | 'rating';
  options: PollOption[];
  status: 'draft' | 'active' | 'archived';
  timeLimitSeconds?: number;
  totalResponses: number;
  createdById: string;
  createdAt: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  studentId: string;
  studentName: string;
  selectedOptionIds: string[];
  votedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  classroomId: string;
  title: string;
  description?: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  status: 'draft' | 'published' | 'closed';
  createdById: string;
  completedCount: number;
  averageScore: number;
  createdAt: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  answers: {
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    earnedMarks: number;
  }[];
  submittedAt: string;
}

export interface ActivityLog {
  id: string;
  classroomId?: string;
  userId: string;
  userName: string;
  type: 'join' | 'leave' | 'poll' | 'quiz' | 'alert' | 'admit';
  message: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'info';
  timestamp: string;
}

export interface DatabaseSchema {
  users: User[];
  classrooms: Classroom[];
  joinRequests: JoinRequest[];
  members: ClassroomMember[];
  polls: Poll[];
  pollVotes: PollVote[];
  quizzes: Quiz[];
  quizSubmissions: QuizSubmission[];
  activityLogs: ActivityLog[];
}
