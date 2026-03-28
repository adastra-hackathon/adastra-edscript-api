import type { UpdateProfileDTO } from '../../application/dtos/UpdateProfileDTO';
import type { UpdateNotificationPrefsDTO } from '../../application/dtos/UpdateNotificationPrefsDTO';

export interface ProfileData {
  id: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: Date;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
  gender: string | null;
  address: string | null;
  level: string;
  points: number;
  balanceAmount: string;
  bonusBalanceAmount: string;
  currency: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: string;
  role: string;
  createdAt: Date;
}

export interface NotificationPrefsData {
  emailOnDeposit: boolean;
  emailOnWithdrawal: boolean;
  checkIntervalMinutes: number | null;
}

export interface IProfileRepository {
  findFullProfile(userId: string): Promise<ProfileData | null>;
  updateProfile(userId: string, data: UpdateProfileDTO): Promise<ProfileData>;
  getPasswordHash(userId: string): Promise<string | null>;
  updatePassword(userId: string, newHash: string): Promise<void>;
  getNotificationPrefs(userId: string): Promise<NotificationPrefsData>;
  updateNotificationPrefs(userId: string, data: UpdateNotificationPrefsDTO): Promise<NotificationPrefsData>;
}
