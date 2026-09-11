import { Router } from 'express';
import { PollController } from '../controllers/poll.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, PollController.getAll);
router.get('/:id', authenticateToken, PollController.getById);
router.post('/', authenticateToken, requireRole('teacher', 'admin'), PollController.create);
router.post('/:id/vote', authenticateToken, PollController.vote);
router.put('/:id/status', authenticateToken, requireRole('teacher', 'admin'), PollController.updateStatus);
router.delete('/:id', authenticateToken, requireRole('teacher', 'admin'), PollController.deletePoll);

export default router;
