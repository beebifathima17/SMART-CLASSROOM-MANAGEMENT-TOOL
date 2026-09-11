import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, QuizController.getAll);
router.get('/:id', authenticateToken, QuizController.getById);
router.post('/', authenticateToken, requireRole('teacher', 'admin'), QuizController.create);
router.post('/:id/submit', authenticateToken, QuizController.submit);
router.delete('/:id', authenticateToken, requireRole('teacher', 'admin'), QuizController.deleteQuiz);

export default router;
