import type { User, UserProfile } from '@prisma/client';

export type UserWithProfile = User & { profile: UserProfile | null };

export interface CreateUserData {
  email: string;
  fullName: string;
  cpf: string;
  phone: string;
  birthDate: Date;
  displayName?: string;
  passwordHash: string;
  ipAddress?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<UserWithProfile | null>;
  findByEmail(email: string): Promise<UserWithProfile | null>;
  findByCpf(cpf: string): Promise<UserWithProfile | null>;
  findByPhone(phone: string): Promise<UserWithProfile | null>;
  create(data: CreateUserData): Promise<UserWithProfile>;
  updateLastLogin(id: string): Promise<void>;
}
