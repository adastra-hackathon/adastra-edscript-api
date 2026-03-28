import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      translatedMessage: 'Dados inválidos. Verifique os campos.',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      translatedMessage: err.translatedMessage,
      field: err.field ?? null,
    });
    return;
  }

  console.error('[Unhandled Error]', err);

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    translatedMessage: 'Erro interno. Tente novamente mais tarde.',
    field: null,
  });
}
