import { Request, Response, NextFunction } from 'express';
import { AiService } from './ai.service.js';

export class AiController {
  public static async parse(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt } = req.body;
      const parsedFilters = await AiService.parseQuery(prompt);
      res.status(200).json({
        success: true,
        data: parsedFilters,
      });
    } catch (error) {
      next(error);
    }
  }
}
