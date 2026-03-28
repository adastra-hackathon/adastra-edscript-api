import type { IProfileRepository, ProfileData } from '../../domain/repositories/IProfileRepository';
import type { UpdateProfileDTO } from '../dtos/UpdateProfileDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class UpdateMyProfileUseCase {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string, dto: UpdateProfileDTO): Promise<ProfileData> {
    const existing = await this.profileRepository.findFullProfile(userId);
    if (!existing) throw new AppError('USER_NOT_FOUND');

    return this.profileRepository.updateProfile(userId, dto);
  }
}
