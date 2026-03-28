import type { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import type { ChangePasswordDTO } from '../dtos/ChangePasswordDTO';
import { HashProvider } from '../../../../shared/utils/hash';
import { AppError } from '../../../../shared/errors/AppError';

export class ChangeMyPasswordUseCase {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string, dto: ChangePasswordDTO): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new AppError('PASSWORD_MISMATCH');
    }

    const currentHash = await this.profileRepository.getPasswordHash(userId);
    if (!currentHash) throw new AppError('USER_NOT_FOUND');

    const isMatch = await HashProvider.compare(dto.currentPassword, currentHash);
    if (!isMatch) throw new AppError('WRONG_PASSWORD');

    const newHash = await HashProvider.hash(dto.newPassword);
    await this.profileRepository.updatePassword(userId, newHash);
  }
}
