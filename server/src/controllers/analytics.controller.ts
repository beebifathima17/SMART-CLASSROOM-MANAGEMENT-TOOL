import { Response } from 'express';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AnalyticsController {
  public static async getTeacherDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const activeClassroom = db.get('classrooms')[0];
      const polls = db.get('polls');
      const quizzes = db.get('quizzes');
      const members = db.get('members');
      const joinRequests = db.get('joinRequests').filter(r => r.status === 'pending');
      const activityLogs = db.get('activityLogs');

      const totalPollVotes = polls.reduce((sum, p) => sum + (p.totalResponses || 0), 0);
      const avgParticipation = members.length > 0
        ? Math.round(members.reduce((sum, m) => sum + m.participationPercentage, 0) / members.length)
        : 0;

      res.status(200).json({
        success: true,
        data: {
          classroom: activeClassroom,
          stats: {
            liveClassrooms: activeClassroom?.isLive ? 1 : 0,
            enrolledStudents: members.length,
            totalPollResponses: totalPollVotes,
            averageParticipation: avgParticipation,
            pendingAdmissionRequests: joinRequests.length
          },
          recentPolls: polls.slice(0, 5),
          recentQuizzes: quizzes.slice(0, 5),
          liveMembers: members,
          activityFeed: activityLogs.slice(0, 8)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error loading dashboard analytics.' });
    }
  }

  public static async getStudentDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const student = req.user!;
      const activeClassroom = db.get('classrooms')[0];
      const activePoll = db.get('polls').find(p => p.status === 'active');
      const quizzes = db.get('quizzes');
      const userSubmissions = db.get('quizSubmissions').filter(s => s.studentId === student.id);
      const member = db.get('members').find(m => m.studentId === student.id);

      const avgQuizScore = userSubmissions.length > 0
        ? Math.round(userSubmissions.reduce((sum, s) => sum + s.percentage, 0) / userSubmissions.length)
        : 0;

      res.status(200).json({
        success: true,
        data: {
          classroom: activeClassroom,
          stats: {
            isLive: activeClassroom?.isLive || false,
            participationPercentage: member?.participationPercentage || 100,
            completedQuizzes: userSubmissions.length,
            averageQuizScore: avgQuizScore,
            hasActivePoll: !!activePoll
          },
          activePoll,
          availableQuizzes: quizzes,
          mySubmissions: userSubmissions
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error loading student analytics.' });
    }
  }
}
