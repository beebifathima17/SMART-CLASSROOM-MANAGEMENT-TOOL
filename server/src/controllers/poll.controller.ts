import { Response } from 'express';
import { db } from '../config/db';
import { Poll, PollVote, PollOption, ActivityLog } from '../models/types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class PollController {
  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { classroomId } = req.query;
      let polls = db.get('polls');
      if (classroomId) {
        polls = polls.filter(p => p.classroomId === classroomId);
      }
      res.status(200).json({ success: true, data: polls });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching polls.' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const poll = db.get('polls').find(p => p.id === id);
      if (!poll) {
        res.status(404).json({ success: false, message: 'Poll not found.' });
        return;
      }

      // Check if current user has already voted
      const userVote = req.user ? db.get('pollVotes').find(v => v.pollId === id && v.studentId === req.user?.id) : null;

      res.status(200).json({
        success: true,
        data: {
          ...poll,
          hasVoted: !!userVote,
          userSelectedOptionIds: userVote?.selectedOptionIds || []
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching poll.' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { classroomId, title, question, type, options, timeLimitSeconds } = req.body;
      const user = req.user!;

      if (!question || !options || !Array.isArray(options) || options.length < 2) {
        res.status(400).json({ success: false, message: 'Question and at least 2 options are required.' });
        return;
      }

      const activeClassrooms = db.get('classrooms');
      const targetClassroom = classroomId ? activeClassrooms.find(c => c.id === classroomId) : activeClassrooms[0];

      const formattedOptions: PollOption[] = options.map((opt: any, index: number) => ({
        id: opt.id || `opt-${Date.now()}-${index}`,
        text: typeof opt === 'string' ? opt.trim() : opt.text.trim(),
        votes: 0,
        isCorrect: opt.isCorrect || false
      }));

      const newPoll: Poll = {
        id: `poll-${Date.now()}`,
        classroomId: targetClassroom?.id || 'cls-wt-01',
        title: title || 'Live Concept Check',
        question: question.trim(),
        type: type || 'multiple-choice',
        options: formattedOptions,
        status: 'draft',
        timeLimitSeconds: timeLimitSeconds || 60,
        totalResponses: 0,
        createdById: user.id,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      db.update('polls', list => [newPoll, ...list]);

      res.status(201).json({ success: true, message: 'Poll created successfully.', data: newPoll });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error creating poll.' });
    }
  }

  public static async vote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { optionIds } = req.body;
      const user = req.user!;

      if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
        res.status(400).json({ success: false, message: 'Please select an option to vote.' });
        return;
      }

      const poll = db.get('polls').find(p => p.id === id);
      if (!poll) {
        res.status(404).json({ success: false, message: 'Poll not found.' });
        return;
      }

      if (poll.status !== 'active') {
        res.status(400).json({ success: false, message: 'This poll is not currently accepting votes.' });
        return;
      }

      // Check if user already voted
      const existingVote = db.get('pollVotes').find(v => v.pollId === id && v.studentId === user.id);
      if (existingVote) {
        res.status(400).json({ success: false, message: 'You have already submitted a vote for this poll.' });
        return;
      }

      // Record vote
      const newVote: PollVote = {
        id: `vote-${Date.now()}`,
        pollId: id,
        studentId: user.id,
        studentName: user.name,
        selectedOptionIds: optionIds,
        votedAt: new Date().toISOString()
      };

      db.update('pollVotes', votes => [...votes, newVote]);

      // Increment counts in poll options
      let updatedPoll: Poll | null = null;
      db.update('polls', polls =>
        polls.map(p => {
          if (p.id === id) {
            const newOptions = p.options.map(opt => {
              if (optionIds.includes(opt.id)) {
                return { ...opt, votes: opt.votes + 1 };
              }
              return opt;
            });
            updatedPoll = {
              ...p,
              options: newOptions,
              totalResponses: p.totalResponses + 1
            };
            return updatedPoll;
          }
          return p;
        })
      );

      res.status(200).json({
        success: true,
        message: 'Vote cast successfully!',
        data: { poll: updatedPoll, vote: newVote }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error casting vote.' });
    }
  }

  public static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'active', 'archived'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status. Must be draft, active, or archived.' });
        return;
      }

      let updatedPoll: Poll | null = null;
      db.update('polls', polls =>
        polls.map(p => {
          if (p.id === id) {
            updatedPoll = { ...p, status };
            return updatedPoll;
          }
          // If setting this poll active, archive other active polls in this classroom
          if (status === 'active' && p.status === 'active') {
            return { ...p, status: 'archived' };
          }
          return p;
        })
      );

      if (!updatedPoll) {
        res.status(404).json({ success: false, message: 'Poll not found.' });
        return;
      }

      res.status(200).json({ success: true, message: `Poll marked as ${status}.`, data: updatedPoll });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error updating poll status.' });
    }
  }

  public static async deletePoll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      db.update('polls', polls => polls.filter(p => p.id !== id));
      db.update('pollVotes', votes => votes.filter(v => v.pollId !== id));
      res.status(200).json({ success: true, message: 'Poll deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error deleting poll.' });
    }
  }
}
