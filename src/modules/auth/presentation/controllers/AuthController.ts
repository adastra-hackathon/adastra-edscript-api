import { Request, Response, NextFunction } from 'express';
import { registerSchema } from '../../application/dtos/RegisterDTO';
import { loginSchema } from '../../application/dtos/LoginDTO';
import { refreshTokenSchema } from '../../application/dtos/RefreshTokenDTO';
import { RegisterUseCase } from '../../application/usecases/RegisterUseCase';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { RefreshTokenUseCase } from '../../application/usecases/RefreshTokenUseCase';
import { PrismaUserRepository } from '../../infra/repositories/PrismaUserRepository';
import { PrismaSessionRepository } from '../../infra/repositories/PrismaSessionRepository';
import type { AuthenticatedRequest } from '../../../../shared/middlewares/authenticate';

const userRepo = new PrismaUserRepository();
const sessionRepo = new PrismaSessionRepository();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = registerSchema.parse(req.body);
      const ipAddress = req.ip;

      const useCase = new RegisterUseCase(userRepo, sessionRepo);
      const result = await useCase.execute(dto, ipAddress);

      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const useCase = new LoginUseCase(userRepo, sessionRepo);
      const result = await useCase.execute(dto, ipAddress, userAgent);

      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);

      const useCase = new RefreshTokenUseCase(userRepo, sessionRepo);
      const result = await useCase.execute(refreshToken);

      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await userRepo.findById(authReq.userId);

      if (!user) {
        res.status(404).json({ status: 'error', message: 'User not found' });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: {
          id: user.id,
          fullName: user.profile?.fullName ?? '',
          displayName: user.profile?.displayName,
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          level: user.profile?.level,
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const useCase = new RefreshTokenUseCase(userRepo, sessionRepo);
      // We leverage the same session lookup to invalidate
      await useCase.execute(refreshToken).catch(() => {});
      // Even if token is already invalid, just revoke all sessions to be safe
      const authReq = req as AuthenticatedRequest;
      await sessionRepo.revokeAllByUserId(authReq.userId);

      res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }
}
