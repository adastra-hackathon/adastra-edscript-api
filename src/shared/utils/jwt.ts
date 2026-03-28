import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

interface AccessTokenPayload {
  sub: string;
  fullName: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export const JwtProvider = {
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  },

  signRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    } catch {
      throw new AppError('TOKEN_INVALID');
    }
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch {
      throw new AppError('TOKEN_INVALID');
    }
  },
};
