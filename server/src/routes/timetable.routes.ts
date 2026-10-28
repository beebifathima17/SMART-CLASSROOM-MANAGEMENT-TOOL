import { Router } from 'express';
import { TimetableController } from '../controllers/timetable.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, TimetableController.getAll);
router.get('/notifications', authenticateToken, TimetableController.getNotifications);
router.post('/notifications/mark-read', authenticateToken, TimetableController.markNotificationsRead);
router.post('/check-conflicts', authenticateToken, TimetableController.checkConflicts);
router.get('/:id', authenticateToken, TimetableController.getById);

// Admin & Faculty update control
router.post('/', authenticateToken, requireRole('teacher', 'admin'), TimetableController.create);
router.put('/:id', authenticateToken, requireRole('teacher', 'admin'), TimetableController.update);
router.delete('/:id', authenticateToken, requireRole('teacher', 'admin'), TimetableController.delete);

export default router;
