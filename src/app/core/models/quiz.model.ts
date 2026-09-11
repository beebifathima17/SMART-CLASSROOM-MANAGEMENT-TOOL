export type QuestionType = 'multiple_choice' | 'true_false';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
  marks: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  classroomId: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  questions: QuizQuestion[];
  status: 'draft' | 'published' | 'closed';
  settings: {
    shuffleQuestions: boolean;
    showScoreAfterSubmission: boolean;
    allowRetake: boolean;
    timeLimitMinutes: number;
  };
  createdAt: string;
  teacherId: string;
  teacherName: string;
  averageScore?: number;
  completedCount?: number;
}

export interface QuestionAnswerRecord {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unansweredCount: number;
  timeTakenSeconds: number;
  submittedAt: string;
  answers: QuestionAnswerRecord[];
}
