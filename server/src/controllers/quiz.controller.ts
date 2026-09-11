import { Response } from 'express';
import { db } from '../config/db';
import { Quiz, QuizSubmission, QuizQuestion } from '../models/types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class QuizController {
  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { classroomId } = req.query;
      let quizzes = db.get('quizzes');
      if (classroomId) {
        quizzes = quizzes.filter(q => q.classroomId === classroomId);
      }

      // If requested by a student, do not leak correctOptionIndex directly in listing
      if (req.user?.role === 'student') {
        const studentQuizzes = quizzes.map(q => ({
          ...q,
          questions: q.questions.map(({ correctOptionIndex, explanation, ...rest }) => rest)
        }));
        res.status(200).json({ success: true, data: studentQuizzes });
        return;
      }

      res.status(200).json({ success: true, data: quizzes });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error retrieving quizzes.' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const quiz = db.get('quizzes').find(q => q.id === id);

      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found.' });
        return;
      }

      const userSubmission = req.user ? db.get('quizSubmissions').find(s => s.quizId === id && s.studentId === req.user?.id) : null;

      // If taking quiz and student has not submitted yet, omit answers
      if (req.user?.role === 'student' && !userSubmission) {
        const sanitizedQuestions = quiz.questions.map(({ correctOptionIndex, explanation, ...rest }) => rest);
        res.status(200).json({
          success: true,
          data: {
            ...quiz,
            questions: sanitizedQuestions,
            hasSubmitted: false
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          ...quiz,
          hasSubmitted: !!userSubmission,
          submission: userSubmission
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching quiz.' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { classroomId, title, description, subject, durationMinutes, questions } = req.body;
      const user = req.user!;

      if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ success: false, message: 'Quiz title and at least 1 question are required.' });
        return;
      }

      const formattedQuestions: QuizQuestion[] = questions.map((q: any, i: number) => ({
        id: q.id || `q-${Date.now()}-${i + 1}`,
        question: q.question.trim(),
        options: q.options || [],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
        marks: q.marks || 10,
        explanation: q.explanation || ''
      }));

      const totalMarks = formattedQuestions.reduce((sum, q) => sum + (q.marks || 10), 0);

      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        classroomId: classroomId || 'cls-wt-01',
        title: title.trim(),
        description: description || '',
        subject: subject || 'General',
        durationMinutes: durationMinutes || 15,
        totalMarks,
        totalQuestions: formattedQuestions.length,
        questions: formattedQuestions,
        status: 'published',
        createdById: user.id,
        completedCount: 0,
        averageScore: 0,
        createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
      };

      db.update('quizzes', list => [newQuiz, ...list]);

      res.status(201).json({ success: true, message: 'Quiz created successfully.', data: newQuiz });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error creating quiz.' });
    }
  }

  public static async submit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { answers } = req.body; // { [questionId: string]: number }
      const user = req.user!;

      const quiz = db.get('quizzes').find(q => q.id === id);
      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found.' });
        return;
      }

      // Check existing submission
      const existing = db.get('quizSubmissions').find(s => s.quizId === id && s.studentId === user.id);
      if (existing) {
        res.status(400).json({ success: false, message: 'You have already submitted this assessment.', data: existing });
        return;
      }

      let totalEarned = 0;
      const gradedAnswers = quiz.questions.map(q => {
        const selectedIndex = answers && answers[q.id] !== undefined ? answers[q.id] : -1;
        const isCorrect = selectedIndex === q.correctOptionIndex;
        const earnedMarks = isCorrect ? q.marks : 0;
        totalEarned += earnedMarks;

        return {
          questionId: q.id,
          selectedOptionIndex: selectedIndex,
          isCorrect,
          earnedMarks
        };
      });

      const percentage = Math.round((totalEarned / (quiz.totalMarks || 1)) * 100);

      const submission: QuizSubmission = {
        id: `sub-${Date.now()}`,
        quizId: id,
        studentId: user.id,
        studentName: user.name,
        score: totalEarned,
        totalMarks: quiz.totalMarks,
        percentage,
        answers: gradedAnswers,
        submittedAt: new Date().toISOString()
      };

      db.update('quizSubmissions', list => [...list, submission]);

      // Update quiz average statistics
      const allSubmissions = db.get('quizSubmissions').filter(s => s.quizId === id);
      const newAverage = Math.round(allSubmissions.reduce((sum, s) => sum + s.percentage, 0) / allSubmissions.length);

      db.update('quizzes', quizzes =>
        quizzes.map(q => (q.id === id ? { ...q, completedCount: allSubmissions.length, averageScore: newAverage } : q))
      );

      res.status(200).json({
        success: true,
        message: 'Quiz submitted and graded successfully!',
        data: submission
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error submitting quiz.' });
    }
  }

  public static async deleteQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      db.update('quizzes', list => list.filter(q => q.id !== id));
      db.update('quizSubmissions', list => list.filter(s => s.quizId !== id));
      res.status(200).json({ success: true, message: 'Quiz deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error deleting quiz.' });
    }
  }
}
