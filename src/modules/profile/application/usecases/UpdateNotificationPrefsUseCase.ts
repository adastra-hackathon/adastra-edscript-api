import type { IProfileRepository, NotificationPrefsData } from '../../domain/repositories/IProfileRepository';
import type { UpdateNotificationPrefsDTO } from '../dtos/UpdateNotificationPrefsDTO';

export class UpdateNotificationPrefsUseCase {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string, dto: UpdateNotificationPrefsDTO): Promise<NotificationPrefsData> {
    return this.profileRepository.updateNotificationPrefs(userId, dto);
  }
}
