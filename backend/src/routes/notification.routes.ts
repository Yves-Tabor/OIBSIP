import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { deleteAllNotifications, getMyNotifications, markAllNotificationsRead } from '../controllers/notification.controller';

const router = Router();

router.get('/my', authenticate, getMyNotifications);
router.patch('/read-all', authenticate, markAllNotificationsRead);
router.delete('/delete-all', authenticate, deleteAllNotifications);

export default router;
