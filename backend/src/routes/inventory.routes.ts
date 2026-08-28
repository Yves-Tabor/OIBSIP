import { Router } from 'express';
import {
  getAllInventory,
  updateInventory,
  createInventory,
  deleteInventory,
} from '../controllers/inventory.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, requireAdmin, getAllInventory);
router.post('/', authenticate, requireAdmin, createInventory);
router.patch('/:id', authenticate, requireAdmin, updateInventory);
router.delete('/:id', authenticate, requireAdmin, deleteInventory);

export default router;
