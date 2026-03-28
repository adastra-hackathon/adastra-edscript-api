import type { IProfileRepository, ProfileData } from '../../domain/repositories/IProfileRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class GetMyProfileUseCase {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string): Promise<ProfileData> {
    const profile = await this.profileRepository.findFullProfile(userId);
    if (!profile) throw new AppError('USER_NOT_FOUND');
    return profile;
  }
}
