import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/teacher-dashboard', authenticateToken, AnalyticsController.getTeacherDashboard);
router.get('/student-dashboard', authenticateToken, AnalyticsController.getStudentDashboard);

export default router;
