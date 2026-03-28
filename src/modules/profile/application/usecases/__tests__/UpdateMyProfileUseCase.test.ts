import { UpdateMyProfileUseCase } from '../UpdateMyProfileUseCase';
import type { IProfileRepository, ProfileData } from '../../../domain/repositories/IProfileRepository';

const mockRepo: jest.Mocked<IProfileRepository> = {
  findFullProfile: jest.fn(),
  updateProfile: jest.fn(),
  getPasswordHash: jest.fn(),
  updatePassword: jest.fn(),
  getNotificationPrefs: jest.fn(),
  updateNotificationPrefs: jest.fn(),
};

const baseProfile: ProfileData = {
  id: 'user-id',
  email: 'test@example.com',
  cpf: '12345678900',
  phone: '11999999999',
  birthDate: new Date('1990-01-01'),
  fullName: 'João da Silva',
  displayName: null,
  avatarUrl: null,
  gender: null,
  address: null,
  level: 'BRONZE',
  points: 0,
  balanceAmount: '0.00',
  bonusBalanceAmount: '0.00',
  currency: 'BRL',
  isEmailVerified: false,
  isPhoneVerified: false,
  status: 'ACTIVE',
  role: 'PLAYER',
  createdAt: new Date(),
};

describe('UpdateMyProfileUseCase', () => {
  let useCase: UpdateMyProfileUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateMyProfileUseCase(mockRepo);
  });

  it('should update profile and return updated data', async () => {
    const updated = { ...baseProfile, fullName: 'João Silva', gender: 'Masculino' };
    mockRepo.findFullProfile.mockResolvedValue(baseProfile);
    mockRepo.updateProfile.mockResolvedValue(updated);

    const result = await useCase.execute('user-id', { fullName: 'João Silva', gender: 'Masculino' });

    expect(result.fullName).toBe('João Silva');
    expect(result.gender).toBe('Masculino');
    expect(mockRepo.updateProfile).toHaveBeenCalledWith('user-id', { fullName: 'João Silva', gender: 'Masculino' });
  });

  it('should throw 404 when user not found', async () => {
    mockRepo.findFullProfile.mockResolvedValue(null);

    await expect(useCase.execute('bad-id', { fullName: 'X' })).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
    expect(mockRepo.updateProfile).not.toHaveBeenCalled();
  });
});
