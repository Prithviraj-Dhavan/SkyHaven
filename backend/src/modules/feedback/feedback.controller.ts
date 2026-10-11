import { Request, Response } from 'express';
import { prisma } from '../../config/database.js';

export class FeedbackController {
  public static async submit(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, message, rating } = req.body;
      const user_id = (req as any).user?.id || null;

      if (!name || !email || !message) {
        res.status(400).json({ success: false, error: { message: 'Name, email, and message are required' } });
        return;
      }

      const feedback = await prisma.feedback.create({
        data: {
          name,
          email,
          message,
          rating,
          user_id,
        },
      });

      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to submit feedback' } });
    }
  }

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const feedbacks = await prisma.feedback.findMany({
        orderBy: { created_at: 'desc' },
      });
      res.json({ success: true, data: feedbacks });
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to fetch feedbacks' } });
    }
  }
}
