import { prisma } from '../../../../shared/infra/database/prisma';
import type { CreateUserData, IUserRepository, UserWithProfile } from '../../domain/repositories/IUserRepository';

const includeProfile = { profile: true } as const;

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({ where: { id, deletedAt: null }, include: includeProfile });
  }

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({ where: { email, deletedAt: null }, include: includeProfile });
  }

  async findByCpf(cpf: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({ where: { cpf, deletedAt: null }, include: includeProfile });
  }

  async findByPhone(phone: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({ where: { phone, deletedAt: null }, include: includeProfile });
  }

  async create(data: CreateUserData): Promise<UserWithProfile> {
    return prisma.user.create({
      include: includeProfile,
      data: {
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        birthDate: data.birthDate,
        credential: {
          create: { passwordHash: data.passwordHash },
        },
        profile: {
          create: {
            fullName: data.fullName,
            displayName: data.displayName,
          },
        },
        wallet: {
          create: {},
        },
        termsAcceptances: {
          create: {
            termType: 'TERMS_OF_SERVICE',
            termVersion: '1.0',
            ipAddress: data.ipAddress,
          },
        },
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
