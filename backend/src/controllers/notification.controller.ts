import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(10);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } });
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

export const deleteAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await Notification.deleteMany({ user: req.userId });
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error('Delete notifications error:', error);
    res.status(500).json({ message: 'Failed to delete notifications' });
  }
};
