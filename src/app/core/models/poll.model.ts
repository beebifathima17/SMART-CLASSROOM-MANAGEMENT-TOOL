export type PollType = 'multiple_choice' | 'yes_no' | 'rating' | 'open_text';
export type PollStatus = 'draft' | 'active' | 'paused' | 'ended';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

export interface PollResponse {
  id: string;
  pollId: string;
  studentId: string;
  studentName: string;
  selectedOptionIds: string[];
  textAnswer?: string;
  ratingValue?: number;
  submittedAt: string;
}

export interface Poll {
  id: string;
  classroomId: string;
  title: string;
  question: string;
  type: PollType;
  options: PollOption[];
  status: PollStatus;
  allowMultipleAnswers: boolean;
  isAnonymous: boolean;
  showResultsToStudents: boolean;
  timeLimitSeconds: number; // 0 for no limit
  secondsRemaining?: number;
  totalResponses: number;
  createdAt: string;
  endedAt?: string;
  teacherId: string;
  teacherName: string;
  subject: string;
}
