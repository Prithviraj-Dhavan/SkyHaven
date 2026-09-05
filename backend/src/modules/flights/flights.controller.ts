import { Request, Response, NextFunction } from 'express';
import { FlightsService } from './flights.service.js';

export class FlightsController {
  public static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await FlightsService.searchFlights(req.query as any);
      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const flight = await FlightsService.getFlightById(req.params.id);
      res.status(200).json({
        success: true,
        data: flight,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAirports(req: Request, res: Response, next: NextFunction) {
    try {
      const airports = await FlightsService.getAirportsAndCities();
      res.status(200).json({
        success: true,
        data: airports,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDeals(req: Request, res: Response, next: NextFunction) {
    try {
      const deals = await FlightsService.getFeaturedDeals();
      res.status(200).json({
        success: true,
        data: deals,
      });
    } catch (error) {
      next(error);
    }
  }
}
