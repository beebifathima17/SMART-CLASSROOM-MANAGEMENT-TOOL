import { Response } from 'express';
import { db } from '../config/db';
import { Classroom, JoinRequest, ClassroomMember, ActivityLog } from '../models/types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ClassroomController {
  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classrooms = db.get('classrooms');
      res.status(200).json({ success: true, data: classrooms });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error retrieving classrooms.' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classroom = db.get('classrooms').find(c => c.id === id || c.roomCode.toUpperCase() === id.toUpperCase());

      if (!classroom) {
        res.status(404).json({ success: false, message: 'Classroom not found.' });
        return;
      }

      const members = db.get('members').filter(m => m.classroomId === classroom.id);
      const pendingRequests = db.get('joinRequests').filter(r => r.classroomId === classroom.id && r.status === 'pending');

      res.status(200).json({
        success: true,
        data: {
          ...classroom,
          members,
          pendingRequests
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching classroom.' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, courseCode, section, schedule, roomLocation } = req.body;

      if (!name || !courseCode) {
        res.status(400).json({ success: false, message: 'Classroom name and course code are required.' });
        return;
      }

      const roomCode = courseCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || `RM${Math.floor(100 + Math.random() * 900)}`;
      const teacher = req.user!;

      const newClassroom: Classroom = {
        id: `cls-${Date.now().toString(36)}`,
        name: name.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        section: section || 'Section A',
        teacherId: teacher.id,
        teacherName: teacher.name,
        roomCode,
        isLive: true,
        startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        schedule: schedule || 'Mon, Wed, Fri • 10:00 AM - 11:00 AM',
        roomLocation: roomLocation || 'Main Hall & Virtual',
        enrolledStudentsCount: 0,
        createdAt: new Date().toISOString()
      };

      db.update('classrooms', list => [newClassroom, ...list]);

      const log: ActivityLog = {
        id: `act-${Date.now()}`,
        classroomId: newClassroom.id,
        userId: teacher.id,
        userName: teacher.name,
        type: 'alert',
        message: `${teacher.name} created classroom ${newClassroom.name} (${newClassroom.courseCode})`,
        badgeType: 'primary',
        timestamp: 'Just now'
      };
      db.update('activityLogs', logs => [log, ...logs]);

      res.status(201).json({ success: true, message: 'Classroom created successfully.', data: newClassroom });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error creating classroom.' });
    }
  }

  public static async toggleLive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let updated: Classroom | null = null;

      db.update('classrooms', list =>
        list.map(c => {
          if (c.id === id) {
            updated = {
              ...c,
              isLive: !c.isLive,
              startedAt: !c.isLive ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
            };
            return updated;
          }
          return c;
        })
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Classroom not found.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Live status updated.', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error updating live status.' });
    }
  }

  public static async requestJoin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { roomCode } = req.body;
      const student = req.user!;

      if (!roomCode) {
        res.status(400).json({ success: false, message: 'Classroom PIN / Room Code is required.' });
        return;
      }

      const classroom = db.get('classrooms').find(c => c.roomCode.toUpperCase() === roomCode.trim().toUpperCase());
      if (!classroom) {
        res.status(404).json({ success: false, message: `Classroom with PIN '${roomCode}' not found.` });
        return;
      }

      // Check if already a member
      const isMember = db.get('members').some(m => m.classroomId === classroom.id && m.studentId === student.id);
      if (isMember) {
        res.status(200).json({
          success: true,
          status: 'already_admitted',
          message: 'Already enrolled in this classroom.',
          data: { classroom }
        });
        return;
      }

      // Check existing pending request
      const existingReq = db.get('joinRequests').find(
        r => r.classroomId === classroom.id && r.studentId === student.id && r.status === 'pending'
      );

      if (existingReq) {
        res.status(200).json({
          success: true,
          status: 'pending',
          message: 'Join request already submitted. Waiting for teacher approval.',
          data: { request: existingReq, classroom }
        });
        return;
      }

      const newReq: JoinRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        classroomId: classroom.id,
        roomCode: classroom.roomCode,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      db.update('joinRequests', list => [newReq, ...list]);

      res.status(201).json({
        success: true,
        status: 'pending',
        message: 'Join request sent. Please wait for professor approval.',
        data: { request: newReq, classroom }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error requesting join.' });
    }
  }

  public static async approveJoin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { requestId } = req.body;
      const request = db.get('joinRequests').find(r => r.id === requestId);

      if (!request) {
        res.status(404).json({ success: false, message: 'Join request not found.' });
        return;
      }

      // Mark request approved
      db.update('joinRequests', list =>
        list.map(r => (r.id === requestId ? { ...r, status: 'approved' } : r))
      );

      // Add to classroom members
      const newMember: ClassroomMember = {
        id: `mem-${Date.now()}`,
        classroomId: request.classroomId,
        studentId: request.studentId,
        studentName: request.studentName,
        studentEmail: request.studentEmail,
        joinedAt: new Date().toISOString(),
        isOnline: true,
        participationPercentage: 100
      };

      db.update('members', list => [...list.filter(m => !(m.classroomId === request.classroomId && m.studentId === request.studentId)), newMember]);

      // Update student count
      db.update('classrooms', list =>
        list.map(c => (c.id === request.classroomId ? { ...c, enrolledStudentsCount: (c.enrolledStudentsCount || 0) + 1 } : c))
      );

      res.status(200).json({ success: true, message: 'Student admitted to classroom.', data: newMember });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error approving request.' });
    }
  }

  public static async rejectJoin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { requestId } = req.body;
      db.update('joinRequests', list =>
        list.map(r => (r.id === requestId ? { ...r, status: 'rejected' } : r))
      );
      res.status(200).json({ success: true, message: 'Request declined.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error rejecting request.' });
    }
  }

  public static async getMembers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const members = db.get('members').filter(m => m.classroomId === id);
      res.status(200).json({ success: true, data: members });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching members.' });
    }
  }
}
