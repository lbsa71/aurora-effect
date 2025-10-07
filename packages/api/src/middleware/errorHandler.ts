import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  const apiError: ApiError = {
    message: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  };

  const statusCode = (err as { statusCode?: number }).statusCode || 500;

  res.status(statusCode).json(apiError);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const apiError: ApiError = {
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  };

  res.status(404).json(apiError);
};
