import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../../../shared/errors/AppError';
import { HashProvider } from '../../../../shared/utils/hash';
import { JwtProvider } from '../../../../shared/utils/jwt';
import { prisma } from '../../../../shared/infra/database/prisma';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { ISessionRepository } from '../../domain/repositories/ISessionRepository';
import type { LoginDTO } from '../dtos/LoginDTO';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(dto: LoginDTO, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    const identifier = dto.identifier.trim();
    const isEmail = identifier.includes('@');

    const user = isEmail
      ? await this.userRepository.findByEmail(identifier.toLowerCase())
      : await this.userRepository.findByCpf(identifier.replace(/\D/g, ''));

    if (!user) {
      throw new AppError('INVALID_CREDENTIALS');
    }

    if (user.status === 'BANNED') {
      throw new AppError('ACCOUNT_SUSPENDED');
    }

    const credential = await prisma.userCredential.findUnique({ where: { userId: user.id } });

    if (!credential) {
      throw new AppError('INVALID_CREDENTIALS');
    }

    if (credential.lockedUntil && credential.lockedUntil > new Date()) {
      throw new AppError('ACCOUNT_LOCKED');
    }

    const passwordMatch = await HashProvider.compare(dto.password, credential.passwordHash);

    if (!passwordMatch) {
      const newFailedAttempts = credential.failedLoginAttempts + 1;
      const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS;

      await prisma.userCredential.update({
        where: { id: credential.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
            : null,
        },
      });

      throw new AppError(shouldLock ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS');
    }

    if (credential.failedLoginAttempts > 0) {
      await prisma.userCredential.update({
        where: { id: credential.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    await this.userRepository.updateLastLogin(user.id);

    const sessionId = uuidv4();
    const refreshToken = JwtProvider.signRefreshToken({ sub: user.id, jti: sessionId });
    const refreshTokenHash = await HashProvider.hash(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    });

    const fullName = user.profile?.fullName ?? '';

    const accessToken = JwtProvider.signAccessToken({
      sub: user.id,
      fullName,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, fullName, email: user.email, role: user.role },
    };
  }
}
