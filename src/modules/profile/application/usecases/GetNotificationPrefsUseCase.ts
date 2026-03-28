import type { IProfileRepository, NotificationPrefsData } from '../../domain/repositories/IProfileRepository';

export class GetNotificationPrefsUseCase {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string): Promise<NotificationPrefsData> {
    return this.profileRepository.getNotificationPrefs(userId);
  }
}
