import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../../../shared/errors/AppError';
import { HashProvider } from '../../../../shared/utils/hash';
import { JwtProvider } from '../../../../shared/utils/jwt';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { ISessionRepository } from '../../domain/repositories/ISessionRepository';
import type { RegisterDTO } from '../dtos/RegisterDTO';

interface RegisterResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(dto: RegisterDTO, ipAddress?: string): Promise<RegisterResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedCpf = dto.cpf.replace(/\D/g, '');
    const normalizedPhone = dto.phone.replace(/\D/g, '');

    const [existingEmail, existingCpf, existingPhone] = await Promise.all([
      this.userRepository.findByEmail(normalizedEmail),
      this.userRepository.findByCpf(normalizedCpf),
      this.userRepository.findByPhone(normalizedPhone),
    ]);

    if (existingEmail) throw new AppError('EMAIL_ALREADY_IN_USE');
    if (existingCpf) throw new AppError('CPF_ALREADY_IN_USE');
    if (existingPhone) throw new AppError('PHONE_ALREADY_IN_USE');

    const passwordHash = await HashProvider.hash(dto.password);

    const user = await this.userRepository.create({
      email: normalizedEmail,
      fullName: dto.fullName,
      cpf: normalizedCpf,
      phone: normalizedPhone,
      birthDate: new Date(dto.birthDate),
      displayName: dto.displayName,
      passwordHash,
      ipAddress,
    });

    const sessionId = uuidv4();
    const refreshToken = JwtProvider.signRefreshToken({ sub: user.id, jti: sessionId });
    const refreshTokenHash = await HashProvider.hash(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      ipAddress,
      expiresAt,
    });

    const fullName = user.profile?.fullName ?? dto.fullName;

    const accessToken = JwtProvider.signAccessToken({
      sub: user.id,
      fullName,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
