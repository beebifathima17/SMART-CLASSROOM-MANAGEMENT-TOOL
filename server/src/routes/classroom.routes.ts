import { Router } from 'express';
import { ClassroomController } from '../controllers/classroom.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, ClassroomController.getAll);
router.get('/:id', authenticateToken, ClassroomController.getById);
router.post('/', authenticateToken, requireRole('teacher', 'admin'), ClassroomController.create);
router.put('/:id/toggle-live', authenticateToken, requireRole('teacher', 'admin'), ClassroomController.toggleLive);
router.post('/join', authenticateToken, ClassroomController.requestJoin);
router.post('/approve-request', authenticateToken, requireRole('teacher', 'admin'), ClassroomController.approveJoin);
router.post('/reject-request', authenticateToken, requireRole('teacher', 'admin'), ClassroomController.rejectJoin);
router.get('/:id/members', authenticateToken, ClassroomController.getMembers);

export default router;
