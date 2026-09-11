import { Injectable, signal } from '@angular/core';
import { Quiz, QuizQuestion, QuizSubmission, QuestionAnswerRecord } from '../models/quiz.model';
import { ToastService } from './toast.service';

export const DEFAULT_QUIZZES: Quiz[] = [];

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private quizzesSignal = signal<Quiz[]>([]);
  private submissionsSignal = signal<Record<string, QuizSubmission>>({});

  public readonly quizzes = this.quizzesSignal.asReadonly();
  public readonly latestSubmission = signal<QuizSubmission | null>(null);

  constructor(private toast: ToastService) {
    this.initQuizStorage();
    this.listenToStorage();
  }

  private isDemoQuiz(q: any): boolean {
    if (!q) return false;
    const id = q.id || '';
    const title = (q.title || '').toLowerCase();
    return (
      id === 'quiz-201' ||
      title.includes('modern frontend & angular signals')
    );
  }

  private initQuizStorage(): void {
    const stored = localStorage.getItem('smartclass_quizzes');
    let cleanQuizzes: Quiz[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cleanQuizzes = parsed.filter(q => !this.isDemoQuiz(q));
        }
      } catch (e) {
        cleanQuizzes = [];
      }
    }
    this.quizzesSignal.set(cleanQuizzes);
    localStorage.setItem('smartclass_quizzes', JSON.stringify(cleanQuizzes));

    const storedSubmissions = localStorage.getItem('smartclass_quiz_submissions');
    if (storedSubmissions) {
      try {
        const subs = JSON.parse(storedSubmissions);
        this.submissionsSignal.set(subs);
        const latestKey = Object.keys(subs)[0];
        if (latestKey) this.latestSubmission.set(subs[latestKey]);
      } catch (e) {}
    }
  }

  private resetQuizzes(): void {
    this.quizzesSignal.set([]);
    this.latestSubmission.set(null);
    localStorage.setItem('smartclass_quizzes', JSON.stringify([]));
  }

  private listenToStorage(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'smartclass_quizzes' && event.newValue) {
        this.quizzesSignal.set(JSON.parse(event.newValue));
      }
      if (event.key === 'smartclass_quiz_submissions' && event.newValue) {
        this.submissionsSignal.set(JSON.parse(event.newValue));
      }
    });
  }

  getQuizById(id: string): Quiz | undefined {
    return this.quizzesSignal().find(q => q.id === id);
  }

  getSubmissionForQuiz(quizId: string): QuizSubmission | undefined {
    return this.submissionsSignal()[quizId];
  }

  createQuiz(quizData: Omit<Quiz, 'id' | 'createdAt' | 'completedCount' | 'averageScore'>): Quiz {
    const totalMarks = quizData.questions.reduce((sum, q) => sum + (q.marks || 10), 0);
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz-${Date.now()}`,
      totalQuestions: quizData.questions.length,
      totalMarks,
      averageScore: 0,
      completedCount: 0,
      createdAt: 'Just now'
    };

    const updated = [newQuiz, ...this.quizzesSignal()];
    this.quizzesSignal.set(updated);
    localStorage.setItem('smartclass_quizzes', JSON.stringify(updated));

    this.toast.success(`Assessment "${newQuiz.title}" created with ${newQuiz.totalQuestions} questions!`, 'Quiz Published');
    return newQuiz;
  }

  updateQuiz(quizId: string, partial: Partial<Quiz>): void {
    this.quizzesSignal.update(quizzes => {
      const updated = quizzes.map(q => q.id === quizId ? { ...q, ...partial } : q);
      localStorage.setItem('smartclass_quizzes', JSON.stringify(updated));
      return updated;
    });
  }

  deleteQuiz(quizId: string): void {
    const quiz = this.getQuizById(quizId);
    const updated = this.quizzesSignal().filter(q => q.id !== quizId);
    this.quizzesSignal.set(updated);
    localStorage.setItem('smartclass_quizzes', JSON.stringify(updated));

    // Remove associated submissions
    this.submissionsSignal.update(subs => {
      const copy = { ...subs };
      delete copy[quizId];
      localStorage.setItem('smartclass_quiz_submissions', JSON.stringify(copy));
      return copy;
    });

    if (this.latestSubmission()?.quizId === quizId) {
      this.latestSubmission.set(null);
    }

    this.toast.info(`Quiz "${quiz?.title || 'Assessment'}" deleted.`, 'Quiz Deleted');
  }

  submitQuiz(
    quizId: string,
    studentId: string,
    studentName: string,
    selectedAnswers: Record<string, string>,
    timeTakenSeconds: number
  ): QuizSubmission {
    const quiz = this.getQuizById(quizId);
    if (!quiz) throw new Error('Quiz not found');

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const answerRecords: QuestionAnswerRecord[] = quiz.questions.map(q => {
      const chosen = selectedAnswers[q.id];
      if (!chosen) {
        unansweredCount++;
        return {
          questionId: q.id,
          selectedOptionId: '',
          isCorrect: false,
          marksAwarded: 0
        };
      }

      const isCorrect = chosen === q.correctOptionId;
      if (isCorrect) {
        correctCount++;
        totalScore += q.marks;
      } else {
        incorrectCount++;
      }

      return {
        questionId: q.id,
        selectedOptionId: chosen,
        isCorrect,
        marksAwarded: isCorrect ? q.marks : 0
      };
    });

    const percentage = Math.round((totalScore / (quiz.totalMarks || 1)) * 100);

    const submission: QuizSubmission = {
      id: `sub-${Date.now()}`,
      quizId,
      quizTitle: quiz.title,
      studentId,
      studentName,
      score: totalScore,
      totalMarks: quiz.totalMarks,
      percentage,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      unansweredCount,
      timeTakenSeconds,
      submittedAt: 'Just now',
      answers: answerRecords
    };

    this.submissionsSignal.update(map => {
      const updatedMap = { ...map, [quizId]: submission };
      localStorage.setItem('smartclass_quiz_submissions', JSON.stringify(updatedMap));
      return updatedMap;
    });

    this.latestSubmission.set(submission);

    // Update quiz average & count
    this.quizzesSignal.update(list => {
      const updatedList = list.map(q => {
        if (q.id === quizId) {
          const newCount = (q.completedCount || 0) + 1;
          const currentTotal = (q.averageScore || 0) * (q.completedCount || 0);
          const newAvg = Math.round((currentTotal + percentage) / newCount);
          return { ...q, completedCount: newCount, averageScore: newAvg };
        }
        return q;
      });
      localStorage.setItem('smartclass_quizzes', JSON.stringify(updatedList));
      return updatedList;
    });

    this.toast.success(`You scored ${totalScore} / ${quiz.totalMarks} (${percentage}%)!`, 'Quiz Evaluated');
    return submission;
  }
}
