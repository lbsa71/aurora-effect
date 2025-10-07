import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../types';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      const apiError: ApiError = {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error,
      };

      res.status(400).json(apiError);
    }
  };
};
