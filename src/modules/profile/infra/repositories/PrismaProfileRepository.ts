import { prisma } from '../../../../shared/infra/database/prisma';
import type { IProfileRepository, ProfileData, NotificationPrefsData } from '../../domain/repositories/IProfileRepository';
import type { UpdateProfileDTO } from '../../application/dtos/UpdateProfileDTO';
import type { UpdateNotificationPrefsDTO } from '../../application/dtos/UpdateNotificationPrefsDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class PrismaProfileRepository implements IProfileRepository {
  async findFullProfile(userId: string): Promise<ProfileData | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: { profile: true, wallet: true },
    });

    if (!user || !user.profile) return null;

    return this.mapToProfileData(user, user.profile, user.wallet);
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<ProfileData> {
    const profileUpdate: Record<string, unknown> = {};
    if (data.fullName !== undefined) profileUpdate.fullName = data.fullName;
    if (data.displayName !== undefined) profileUpdate.displayName = data.displayName;
    if (data.gender !== undefined) profileUpdate.gender = data.gender;
    if (data.address !== undefined) profileUpdate.address = data.address;

    const userUpdate: Record<string, unknown> = {};
    if (data.phone !== undefined) userUpdate.phone = data.phone;

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          ...userUpdate,
          profile: Object.keys(profileUpdate).length > 0
            ? { update: profileUpdate }
            : undefined,
        },
        include: { profile: true, wallet: true },
      }),
    ]);

    return this.mapToProfileData(user, user.profile!, user.wallet);
  }

  async getPasswordHash(userId: string): Promise<string | null> {
    const credential = await prisma.userCredential.findUnique({ where: { userId } });
    return credential?.passwordHash ?? null;
  }

  async updatePassword(userId: string, newHash: string): Promise<void> {
    await prisma.userCredential.update({
      where: { userId },
      data: { passwordHash: newHash, failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  async getNotificationPrefs(userId: string): Promise<NotificationPrefsData> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: { notificationPreference: true },
    });

    if (!profile?.notificationPreference) {
      return { emailOnDeposit: true, emailOnWithdrawal: true, checkIntervalMinutes: null };
    }

    return {
      emailOnDeposit: profile.notificationPreference.emailOnDeposit,
      emailOnWithdrawal: profile.notificationPreference.emailOnWithdrawal,
      checkIntervalMinutes: profile.notificationPreference.checkIntervalMinutes,
    };
  }

  async updateNotificationPrefs(userId: string, data: UpdateNotificationPrefsDTO): Promise<NotificationPrefsData> {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError('USER_NOT_FOUND');

    const pref = await prisma.userNotificationPreference.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        emailOnDeposit: data.emailOnDeposit ?? true,
        emailOnWithdrawal: data.emailOnWithdrawal ?? true,
        checkIntervalMinutes: data.checkIntervalMinutes ?? null,
      },
      update: {
        ...(data.emailOnDeposit !== undefined && { emailOnDeposit: data.emailOnDeposit }),
        ...(data.emailOnWithdrawal !== undefined && { emailOnWithdrawal: data.emailOnWithdrawal }),
        ...(data.checkIntervalMinutes !== undefined && { checkIntervalMinutes: data.checkIntervalMinutes }),
      },
    });

    return {
      emailOnDeposit: pref.emailOnDeposit,
      emailOnWithdrawal: pref.emailOnWithdrawal,
      checkIntervalMinutes: pref.checkIntervalMinutes,
    };
  }

  private mapToProfileData(
    user: { id: string; email: string; cpf: string; phone: string; birthDate: Date; role: string; status: string; isEmailVerified: boolean; isPhoneVerified: boolean; createdAt: Date },
    profile: { fullName: string; displayName: string | null; avatarUrl: string | null; gender: string | null; address: string | null; level: string; points: number },
    wallet: { balanceAmount: { toString(): string }; bonusBalanceAmount: { toString(): string }; currency: string } | null,
  ): ProfileData {
    return {
      id: user.id,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      birthDate: user.birthDate,
      fullName: profile.fullName,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      gender: profile.gender,
      address: profile.address,
      level: profile.level,
      points: profile.points,
      balanceAmount: wallet?.balanceAmount.toString() ?? '0',
      bonusBalanceAmount: wallet?.bonusBalanceAmount.toString() ?? '0',
      currency: wallet?.currency ?? 'BRL',
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
