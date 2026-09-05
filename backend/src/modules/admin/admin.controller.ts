import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';

export class AdminController {
  public static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getFlights(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const result = await AdminService.getAllFlights(page, limit);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const result = await AdminService.getAllBookings(page, limit);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createFlight(req: Request, res: Response, next: NextFunction) {
    try {
      const flight = await AdminService.createFlight(req.body);
      res.status(201).json({
        success: true,
        message: 'Flight created successfully with generated cabin layout',
        data: flight,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateFlight(req: Request, res: Response, next: NextFunction) {
    try {
      const flight = await AdminService.updateFlight(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Flight updated successfully',
        data: flight,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteFlight(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteFlight(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Flight deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
