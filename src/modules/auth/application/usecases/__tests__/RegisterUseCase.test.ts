import { RegisterUseCase } from '../RegisterUseCase';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { ISessionRepository } from '../../../domain/repositories/ISessionRepository';

// Mock prisma used inside RegisterUseCase for profile lookup
jest.mock('../../../../../shared/infra/database/prisma', () => ({
  prisma: {
    userProfile: { findUnique: jest.fn().mockResolvedValue({ fullName: 'Test User' }) },
  },
}));

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

const validDto = {
  fullName: 'Test User',
  email: 'test@example.com',
  cpf: '12345678900',
  phone: '11999999999',
  birthDate: '1990-01-01',
  password: 'Password@123',
};

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUseCase(mockUserRepo, mockSessionRepo);
  });

  it('should register a new user successfully', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.findByCpf.mockResolvedValue(null);
    mockUserRepo.findByPhone.mockResolvedValue(null);
    mockUserRepo.create.mockResolvedValue({
      id: 'user-id',
      email: validDto.email,
      cpf: validDto.cpf,
      phone: validDto.phone,
      birthDate: new Date(validDto.birthDate),
      role: 'PLAYER',
      status: 'PENDING_VERIFICATION',
      isEmailVerified: false,
      isPhoneVerified: false,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as any);
    mockSessionRepo.create.mockResolvedValue({} as any);

    const result = await useCase.execute(validDto);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe(validDto.email);
    expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
  });

  it('should throw 409 if email already exists', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing' } as any);
    mockUserRepo.findByCpf.mockResolvedValue(null);
    mockUserRepo.findByPhone.mockResolvedValue(null);

    await expect(useCase.execute(validDto)).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email already in use',
    });
  });

  it('should throw 409 if CPF already exists', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.findByCpf.mockResolvedValue({ id: 'existing' } as any);
    mockUserRepo.findByPhone.mockResolvedValue(null);

    await expect(useCase.execute(validDto)).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});
