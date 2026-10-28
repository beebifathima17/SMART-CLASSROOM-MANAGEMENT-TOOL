import { Response } from 'express';
import { db } from '../config/db';
import { TimetableSlot, ScheduleNotification } from '../models/types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TimetableController {
  // Conflict Detection Algorithm
  private static findConflicts(
    candidate: Partial<TimetableSlot>,
    excludeId?: string
  ): { type: 'room' | 'faculty' | 'section'; message: string; conflictingSlot: TimetableSlot }[] {
    const slots = db.get('timetableSlots');
    const conflicts: { type: 'room' | 'faculty' | 'section'; message: string; conflictingSlot: TimetableSlot }[] = [];

    for (const slot of slots) {
      if (excludeId && slot.id === excludeId) continue;
      if (slot.status === 'cancelled') continue;

      // Check if same day
      if (slot.day === candidate.day) {
        // Check time slot collision (exact match or overlapping)
        const isTimeMatch =
          slot.timeSlot === candidate.timeSlot ||
          (slot.startTime === candidate.startTime && slot.endTime === candidate.endTime);

        if (isTimeMatch) {
          // 1. Room collision
          if (candidate.room && slot.room.trim().toLowerCase() === candidate.room.trim().toLowerCase()) {
            conflicts.push({
              type: 'room',
              message: `Room Conflict: '${slot.room}' is already booked by ${slot.facultyName} for ${slot.courseCode} (${slot.courseName}) on ${slot.day} at ${slot.timeSlot}.`,
              conflictingSlot: slot
            });
          }

          // 2. Faculty collision
          if (
            (candidate.facultyId && slot.facultyId === candidate.facultyId) ||
            (candidate.facultyName && slot.facultyName.trim().toLowerCase() === candidate.facultyName.trim().toLowerCase())
          ) {
            conflicts.push({
              type: 'faculty',
              message: `Faculty Conflict: ${slot.facultyName} is already assigned to teach ${slot.courseCode} in ${slot.room} at this time.`,
              conflictingSlot: slot
            });
          }

          // 3. Section collision
          if (
            candidate.section &&
            slot.section.trim().toLowerCase() === candidate.section.trim().toLowerCase()
          ) {
            conflicts.push({
              type: 'section',
              message: `Section Conflict: Section '${slot.section}' already has ${slot.courseCode} scheduled on ${slot.day} at ${slot.timeSlot}.`,
              conflictingSlot: slot
            });
          }
        }
      }
    }

    return conflicts;
  }

  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { day, section, facultyId } = req.query;
      let slots = db.get('timetableSlots') || [];

      if (day) {
        slots = slots.filter(s => s.day.toLowerCase() === (day as string).toLowerCase());
      }
      if (section && section !== 'All Sections') {
        slots = slots.filter(s => s.section.toLowerCase() === (section as string).toLowerCase());
      }
      if (facultyId) {
        slots = slots.filter(s => s.facultyId === facultyId);
      }

      // Compute global conflict status
      const allSlots = db.get('timetableSlots') || [];
      let totalConflicts = 0;
      for (const slot of allSlots) {
        const c = TimetableController.findConflicts(slot, slot.id);
        if (c.length > 0) totalConflicts++;
      }

      res.status(200).json({
        success: true,
        data: slots,
        meta: {
          totalSlots: slots.length,
          totalConflicts: Math.floor(totalConflicts / 2) // avoid double counting
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching timetable slots.' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const slot = db.get('timetableSlots').find(s => s.id === id);

      if (!slot) {
        res.status(404).json({ success: false, message: 'Timetable slot not found.' });
        return;
      }

      const conflicts = TimetableController.findConflicts(slot, slot.id);
      res.status(200).json({ success: true, data: slot, conflicts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching slot.' });
    }
  }

  public static async checkConflicts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const candidate = req.body;
      const excludeId = req.query.excludeId as string | undefined;
      const conflicts = TimetableController.findConflicts(candidate, excludeId);

      res.status(200).json({
        success: true,
        hasConflict: conflicts.length > 0,
        conflicts
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error checking conflicts.' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        courseCode,
        courseName,
        facultyName,
        facultyId,
        day,
        startTime,
        endTime,
        room,
        section,
        semester,
        type,
        colorTag,
        force
      } = req.body;

      const user = req.user!;

      if (!courseCode || !courseName || !day || !startTime || !endTime || !room) {
        res.status(400).json({ success: false, message: 'Missing required timetable slot fields.' });
        return;
      }

      const timeSlot = `${startTime} - ${endTime}`;
      const candidate = {
        courseCode,
        courseName,
        facultyName: facultyName || user.name,
        facultyId: facultyId || user.id,
        day,
        timeSlot,
        startTime,
        endTime,
        room,
        section: section || 'CSE-A',
        semester: semester || 'Semester 5',
        type: type || 'Lecture',
        colorTag: colorTag || 'indigo',
        status: 'scheduled' as const
      };

      // Check conflicts
      const conflicts = TimetableController.findConflicts(candidate);
      if (conflicts.length > 0 && !force) {
        res.status(409).json({
          success: false,
          hasConflict: true,
          message: 'Schedule conflict detected! Room or Faculty is already occupied.',
          conflicts
        });
        return;
      }

      const newSlot: TimetableSlot = {
        ...candidate,
        id: `slot-${Date.now().toString(36)}`,
        updatedAt: new Date().toISOString(),
        updatedBy: user.name
      };

      db.update('timetableSlots', slots => [...slots, newSlot]);

      // Add schedule notification
      const notification: ScheduleNotification = {
        id: `notif-${Date.now()}`,
        title: 'New Class Scheduled',
        message: `${newSlot.courseCode} (${newSlot.courseName}) added on ${newSlot.day} at ${newSlot.timeSlot} in ${newSlot.room}.`,
        type: 'update',
        timestamp: 'Just now',
        read: false,
        slotId: newSlot.id
      };
      db.update('scheduleNotifications', notifs => [notification, ...notifs]);

      res.status(201).json({
        success: true,
        message: 'Timetable slot created successfully.',
        data: newSlot
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error creating timetable slot.' });
    }
  }

  public static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = req.user!;

      const existingSlot = db.get('timetableSlots').find(s => s.id === id);
      if (!existingSlot) {
        res.status(404).json({ success: false, message: 'Timetable slot not found.' });
        return;
      }

      const merged = { ...existingSlot, ...updates };
      if (updates.startTime && updates.endTime) {
        merged.timeSlot = `${updates.startTime} - ${updates.endTime}`;
      }

      // Check conflict if room, faculty, day, or time changed
      if (
        updates.room ||
        updates.day ||
        updates.startTime ||
        updates.endTime ||
        updates.facultyName
      ) {
        const conflicts = TimetableController.findConflicts(merged, id);
        if (conflicts.length > 0 && !updates.force) {
          res.status(409).json({
            success: false,
            hasConflict: true,
            message: 'Conflict detected with another class during this time or room!',
            conflicts
          });
          return;
        }
      }

      let updatedSlot: TimetableSlot | null = null;
      db.update('timetableSlots', slots =>
        slots.map(s => {
          if (s.id === id) {
            const result: TimetableSlot = {
              ...merged,
              updatedAt: new Date().toISOString(),
              updatedBy: user.name
            };
            updatedSlot = result;
            return result;
          }
          return s;
        })
      );

      // Create high-visibility Notification for Students & Faculty
      const notifType = updates.status === 'cancelled' ? 'cancel' : (updates.status === 'rescheduled' ? 'reschedule' : 'update');
      const noteSuffix = updates.updateNote ? ` Note: "${updates.updateNote}"` : '';

      const notification: ScheduleNotification = {
        id: `notif-${Date.now()}`,
        title: updates.status === 'cancelled' ? 'Class Cancelled' : 'Schedule Update Alert',
        message: `${existingSlot.courseCode} on ${merged.day} ${merged.timeSlot} was updated in ${merged.room} by ${user.name}.${noteSuffix}`,
        type: notifType,
        timestamp: 'Just now',
        read: false,
        slotId: id
      };
      db.update('scheduleNotifications', notifs => [notification, ...notifs]);

      res.status(200).json({
        success: true,
        message: 'Timetable slot updated successfully with update control.',
        data: updatedSlot,
        notification
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error updating slot.' });
    }
  }

  public static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const slot = db.get('timetableSlots').find(s => s.id === id);
      if (!slot) {
        res.status(404).json({ success: false, message: 'Slot not found.' });
        return;
      }

      db.update('timetableSlots', slots => slots.filter(s => s.id !== id));

      const notification: ScheduleNotification = {
        id: `notif-${Date.now()}`,
        title: 'Timetable Slot Removed',
        message: `${slot.courseCode} (${slot.courseName}) on ${slot.day} ${slot.timeSlot} was removed from the schedule.`,
        type: 'cancel',
        timestamp: 'Just now',
        read: false
      };
      db.update('scheduleNotifications', notifs => [notification, ...notifs]);

      res.status(200).json({ success: true, message: 'Timetable slot removed.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error deleting slot.' });
    }
  }

  public static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notifs = db.get('scheduleNotifications') || [];
      const unreadCount = notifs.filter(n => !n.read).length;

      res.status(200).json({
        success: true,
        data: notifs,
        unreadCount
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching notifications.' });
    }
  }

  public static async markNotificationsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      db.update('scheduleNotifications', notifs => notifs.map(n => ({ ...n, read: true })));
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error marking notifications.' });
    }
  }
}
