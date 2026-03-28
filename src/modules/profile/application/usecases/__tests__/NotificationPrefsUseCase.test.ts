import { GetNotificationPrefsUseCase } from '../GetNotificationPrefsUseCase';
import { UpdateNotificationPrefsUseCase } from '../UpdateNotificationPrefsUseCase';
import type { IProfileRepository, NotificationPrefsData } from '../../../domain/repositories/IProfileRepository';

const mockRepo: jest.Mocked<IProfileRepository> = {
  findFullProfile: jest.fn(),
  updateProfile: jest.fn(),
  getPasswordHash: jest.fn(),
  updatePassword: jest.fn(),
  getNotificationPrefs: jest.fn(),
  updateNotificationPrefs: jest.fn(),
};

const defaultPrefs: NotificationPrefsData = {
  emailOnDeposit: true,
  emailOnWithdrawal: true,
  checkIntervalMinutes: null,
};

describe('GetNotificationPrefsUseCase', () => {
  it('should return notification preferences', async () => {
    mockRepo.getNotificationPrefs.mockResolvedValue(defaultPrefs);
    const useCase = new GetNotificationPrefsUseCase(mockRepo);

    const result = await useCase.execute('user-id');

    expect(result).toEqual(defaultPrefs);
    expect(mockRepo.getNotificationPrefs).toHaveBeenCalledWith('user-id');
  });
});

describe('UpdateNotificationPrefsUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should update and return preferences', async () => {
    const updated: NotificationPrefsData = { emailOnDeposit: false, emailOnWithdrawal: true, checkIntervalMinutes: 30 };
    mockRepo.updateNotificationPrefs.mockResolvedValue(updated);
    const useCase = new UpdateNotificationPrefsUseCase(mockRepo);

    const result = await useCase.execute('user-id', { emailOnDeposit: false, checkIntervalMinutes: 30 });

    expect(result).toEqual(updated);
    expect(mockRepo.updateNotificationPrefs).toHaveBeenCalledWith('user-id', { emailOnDeposit: false, checkIntervalMinutes: 30 });
  });
});
