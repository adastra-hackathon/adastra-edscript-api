import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { JwtProvider } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('TOKEN_INVALID');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = JwtProvider.verifyAccessToken(token);
    (req as AuthenticatedRequest).userId = payload.sub;
    next();
  } catch {
    throw new AppError('TOKEN_EXPIRED');
  }
}
