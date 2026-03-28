import { GetMyProfileUseCase } from '../GetMyProfileUseCase';
import type { IProfileRepository, ProfileData } from '../../../domain/repositories/IProfileRepository';

const mockRepo: jest.Mocked<IProfileRepository> = {
  findFullProfile: jest.fn(),
  updateProfile: jest.fn(),
  getPasswordHash: jest.fn(),
  updatePassword: jest.fn(),
  getNotificationPrefs: jest.fn(),
  updateNotificationPrefs: jest.fn(),
};

const mockProfile: ProfileData = {
  id: 'user-id',
  email: 'test@example.com',
  cpf: '12345678900',
  phone: '11999999999',
  birthDate: new Date('1990-01-01'),
  fullName: 'João da Silva',
  displayName: 'João',
  avatarUrl: null,
  gender: null,
  address: null,
  level: 'BRONZE',
  points: 0,
  balanceAmount: '1250.00',
  bonusBalanceAmount: '0.00',
  currency: 'BRL',
  isEmailVerified: false,
  isPhoneVerified: false,
  status: 'ACTIVE',
  role: 'PLAYER',
  createdAt: new Date(),
};

describe('GetMyProfileUseCase', () => {
  let useCase: GetMyProfileUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetMyProfileUseCase(mockRepo);
  });

  it('should return profile when user exists', async () => {
    mockRepo.findFullProfile.mockResolvedValue(mockProfile);

    const result = await useCase.execute('user-id');

    expect(result).toEqual(mockProfile);
    expect(mockRepo.findFullProfile).toHaveBeenCalledWith('user-id');
  });

  it('should throw 404 when user not found', async () => {
    mockRepo.findFullProfile.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
  });
});
