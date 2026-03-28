import { ChangeMyPasswordUseCase } from '../ChangeMyPasswordUseCase';
import type { IProfileRepository } from '../../../domain/repositories/IProfileRepository';
import { HashProvider } from '../../../../../shared/utils/hash';

jest.mock('../../../../../shared/utils/hash');

const mockRepo: jest.Mocked<IProfileRepository> = {
  findFullProfile: jest.fn(),
  updateProfile: jest.fn(),
  getPasswordHash: jest.fn(),
  updatePassword: jest.fn(),
  getNotificationPrefs: jest.fn(),
  updateNotificationPrefs: jest.fn(),
};

describe('ChangeMyPasswordUseCase', () => {
  let useCase: ChangeMyPasswordUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ChangeMyPasswordUseCase(mockRepo);
  });

  it('should change password successfully', async () => {
    mockRepo.getPasswordHash.mockResolvedValue('$hashed$current');
    (HashProvider.compare as jest.Mock).mockResolvedValue(true);
    (HashProvider.hash as jest.Mock).mockResolvedValue('$hashed$new');

    await useCase.execute('user-id', {
      currentPassword: 'Current@123',
      newPassword: 'New@Password1',
      confirmPassword: 'New@Password1',
    });

    expect(mockRepo.updatePassword).toHaveBeenCalledWith('user-id', '$hashed$new');
  });

  it('should throw 400 when passwords do not match', async () => {
    await expect(
      useCase.execute('user-id', {
        currentPassword: 'Current@123',
        newPassword: 'New@Password1',
        confirmPassword: 'Different@456',
      }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'PASSWORD_MISMATCH' });

    expect(mockRepo.getPasswordHash).not.toHaveBeenCalled();
  });

  it('should throw 404 when credential not found', async () => {
    mockRepo.getPasswordHash.mockResolvedValue(null);

    await expect(
      useCase.execute('user-id', {
        currentPassword: 'Current@123',
        newPassword: 'New@Password1',
        confirmPassword: 'New@Password1',
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: 'USER_NOT_FOUND' });
  });

  it('should throw 400 when current password is wrong', async () => {
    mockRepo.getPasswordHash.mockResolvedValue('$hashed$current');
    (HashProvider.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute('user-id', {
        currentPassword: 'Wrong@Pass1',
        newPassword: 'New@Password1',
        confirmPassword: 'New@Password1',
      }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'WRONG_PASSWORD' });

    expect(mockRepo.updatePassword).not.toHaveBeenCalled();
  });
});
