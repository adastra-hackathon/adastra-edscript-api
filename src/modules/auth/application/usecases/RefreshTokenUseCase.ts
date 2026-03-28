import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../../../shared/errors/AppError';
import { HashProvider } from '../../../../shared/utils/hash';
import { JwtProvider } from '../../../../shared/utils/jwt';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { ISessionRepository } from '../../domain/repositories/ISessionRepository';

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(rawRefreshToken: string): Promise<RefreshResult> {
    const payload = JwtProvider.verifyRefreshToken(rawRefreshToken);

    // Find all sessions for user and check against hashed token
    // We scan by userId rather than storing the token directly
    const user = await this.userRepository.findById(payload.sub);

    if (!user) throw new AppError('USER_NOT_FOUND');

    // Find session by comparing hash
    const { prisma } = await import('../../../../shared/infra/database/prisma');
    const sessions = await prisma.userSession.findMany({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    let matchedSession = null;
    for (const session of sessions) {
      const match = await HashProvider.compare(rawRefreshToken, session.refreshTokenHash);
      if (match) { matchedSession = session; break; }
    }

    if (!matchedSession) throw new AppError('SESSION_NOT_FOUND');

    await this.sessionRepository.revokeById(matchedSession.id);

    const sessionId = uuidv4();
    const newRefreshToken = JwtProvider.signRefreshToken({ sub: user.id, jti: sessionId });
    const refreshTokenHash = await HashProvider.hash(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      expiresAt,
    });

    const accessToken = JwtProvider.signAccessToken({
      sub: user.id,
      fullName: user.profile?.fullName ?? '',
      email: user.email,
      role: user.role,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
