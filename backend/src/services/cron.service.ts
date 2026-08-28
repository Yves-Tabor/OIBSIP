import cron from 'node-cron';
import Inventory from '../models/Inventory';
import { sendLowStockAlert } from './email.service';

export const startCronJobs = (): void => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running inventory check...');

      const lowStockItems = await Inventory.find({
        $expr: { $lt: ['$quantity', '$threshold'] },
      });

      if (lowStockItems.length > 0) {
        await sendLowStockAlert(lowStockItems);
        console.log(`Low stock alert sent for ${lowStockItems.length} items`);
      } else {
        console.log('All items are in stock');
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

  console.log('✅ Cron jobs started');
};
