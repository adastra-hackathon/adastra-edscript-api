import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../../shared/middlewares/authenticate';
import { PrismaProfileRepository } from '../../infra/repositories/PrismaProfileRepository';
import { GetMyProfileUseCase } from '../../application/usecases/GetMyProfileUseCase';
import { UpdateMyProfileUseCase } from '../../application/usecases/UpdateMyProfileUseCase';
import { ChangeMyPasswordUseCase } from '../../application/usecases/ChangeMyPasswordUseCase';
import { GetNotificationPrefsUseCase } from '../../application/usecases/GetNotificationPrefsUseCase';
import { UpdateNotificationPrefsUseCase } from '../../application/usecases/UpdateNotificationPrefsUseCase';
import { updateProfileSchema } from '../../application/dtos/UpdateProfileDTO';
import { changePasswordSchema } from '../../application/dtos/ChangePasswordDTO';
import { updateNotificationPrefsSchema } from '../../application/dtos/UpdateNotificationPrefsDTO';

const repo = new PrismaProfileRepository();

export class ProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthenticatedRequest;
      const useCase = new GetMyProfileUseCase(repo);
      const profile = await useCase.execute(userId);

      res.status(200).json({ status: 'success', data: toProfileResponse(profile) });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthenticatedRequest;
      const dto = updateProfileSchema.parse(req.body);
      const useCase = new UpdateMyProfileUseCase(repo);
      const profile = await useCase.execute(userId, dto);

      res.status(200).json({ status: 'success', data: toProfileResponse(profile) });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthenticatedRequest;
      const dto = changePasswordSchema.parse(req.body);
      const useCase = new ChangeMyPasswordUseCase(repo);
      await useCase.execute(userId, dto);

      res.status(200).json({ status: 'success', message: 'Senha alterada com sucesso.' });
    } catch (err) {
      next(err);
    }
  }

  async getNotificationPrefs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthenticatedRequest;
      const useCase = new GetNotificationPrefsUseCase(repo);
      const prefs = await useCase.execute(userId);

      res.status(200).json({ status: 'success', data: prefs });
    } catch (err) {
      next(err);
    }
  }

  async updateNotificationPrefs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthenticatedRequest;
      const dto = updateNotificationPrefsSchema.parse(req.body);
      const useCase = new UpdateNotificationPrefsUseCase(repo);
      const prefs = await useCase.execute(userId, dto);

      res.status(200).json({ status: 'success', data: prefs });
    } catch (err) {
      next(err);
    }
  }
}

function toProfileResponse(p: Awaited<ReturnType<GetMyProfileUseCase['execute']>>) {
  return {
    id: p.id,
    fullName: p.fullName,
    displayName: p.displayName,
    email: p.email,
    cpf: p.cpf,
    phone: p.phone,
    birthDate: p.birthDate,
    gender: p.gender,
    address: p.address,
    avatarUrl: p.avatarUrl,
    level: p.level,
    points: p.points,
    wallet: {
      balance: p.balanceAmount,
      bonusBalance: p.bonusBalanceAmount,
      currency: p.currency,
    },
    isEmailVerified: p.isEmailVerified,
    isPhoneVerified: p.isPhoneVerified,
    status: p.status,
    role: p.role,
    createdAt: p.createdAt,
    editableFields: ['fullName', 'displayName', 'phone', 'gender', 'address'],
  };
}
