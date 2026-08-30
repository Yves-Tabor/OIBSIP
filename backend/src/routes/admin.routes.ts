import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { getAnalytics } from '../controllers/analytics.controller';

const router = Router();

router.get('/analytics', authenticate, requireAdmin, getAnalytics);

export default router;