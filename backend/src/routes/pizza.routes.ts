import { Router } from 'express';
import { getPizzaOptions, updatePizzaOptionStock } from '../controllers/pizza.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/options', getPizzaOptions);
router.patch('/options/stock', authenticate, requireAdmin, updatePizzaOptionStock);

export default router;
