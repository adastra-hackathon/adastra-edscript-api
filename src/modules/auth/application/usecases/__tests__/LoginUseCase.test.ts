import { LoginUseCase } from '../LoginUseCase';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { ISessionRepository } from '../../../domain/repositories/ISessionRepository';

jest.mock('../../../../../shared/infra/database/prisma', () => ({
  prisma: {
    userCredential: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from '../../../../../shared/infra/database/prisma';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByCpf: jest.fn(),
  findByPhone: jest.fn(),
  create: jest.fn(),
  updateLastLogin: jest.fn(),
};

const mockSessionRepo: jest.Mocked<ISessionRepository> = {
  create: jest.fn(),
  findByRefreshTokenHash: jest.fn(),
  revokeById: jest.fn(),
  revokeAllByUserId: jest.fn(),
};

const mockUser = {
  id: 'user-id',
  email: 'test@example.com',
  cpf: '12345678900',
  phone: '11999999999',
  role: 'PLAYER',
  status: 'ACTIVE',
  isEmailVerified: false,
  isPhoneVerified: false,
  lastLoginAt: null,
  birthDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockUserRepo, mockSessionRepo);
  });

  it('should throw 401 if user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ identifier: 'notfound@test.com', password: 'anything' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should throw 403 if user is banned', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, status: 'BANNED' } as any);

    await expect(
      useCase.execute({ identifier: 'test@example.com', password: 'anything' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('should throw 401 if credential not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser as any);
    (prisma.userCredential.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({ identifier: 'test@example.com', password: 'anything' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should throw 423 if account is locked', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser as any);
    (prisma.userCredential.findUnique as jest.Mock).mockResolvedValue({
      id: 'cred-id',
      passwordHash: 'hash',
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() + 10 * 60 * 1000), // locked for 10 more minutes
    });

    await expect(
      useCase.execute({ identifier: 'test@example.com', password: 'anything' }),
    ).rejects.toMatchObject({ statusCode: 423 });
  });
});
