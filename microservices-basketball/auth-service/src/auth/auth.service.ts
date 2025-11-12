import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../entities/user.entity';
import { Role, RoleType } from '../entities/role.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar si el email ya existe
    const existingEmail = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new UnauthorizedException('Email already in use');
    }

    // Verificar si el username ya existe
    const existingUsername = await this.userRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUsername) {
      throw new UnauthorizedException('Username already in use');
    }

    // Hash password
    const saltRounds = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'), 10);
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Obtener rol de USER por defecto
    let userRole = await this.roleRepository.findOne({
      where: { name: RoleType.USER },
    });

    // Si no existe el rol, crearlo
    if (!userRole) {
      userRole = this.roleRepository.create({
        name: RoleType.USER,
        description: 'Usuario estándar',
      });
      await this.roleRepository.save(userRole);
    }

    // Crear usuario
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      roles: [userRole],
    });

    await this.userRepository.save(user);

    // Generar tokens
    const tokens = await this.generateTokens(user);

    return {
      message: 'User registered successfully',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar estado del usuario
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generar tokens
    const tokens = await this.generateTokens(user, userAgent, ipAddress);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    // Buscar el refresh token
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user', 'user.roles'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verificar si está revocado
    if (tokenRecord.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Verificar expiración
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Revocar el token anterior
    tokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    // Generar nuevos tokens
    const tokens = await this.generateTokens(tokenRecord.user);

    return {
      message: 'Tokens refreshed successfully',
      user: this.sanitizeUser(tokenRecord.user),
      ...tokens,
    };
  }

  async logout(userId: number, refreshToken?: string) {
    if (refreshToken) {
      // Revocar el refresh token específico
      await this.refreshTokenRepository.update(
        { token: refreshToken, user: { id: userId } },
        { isRevoked: true },
      );
    } else {
      // Revocar todos los refresh tokens del usuario
      await this.refreshTokenRepository.update(
        { user: { id: userId } },
        { isRevoked: true },
      );
    }

    return { message: 'Logout successful' };
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verificar password actual
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash nueva password
    const saltRounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '10'), 10);
    user.password = await bcrypt.hash(newPassword, saltRounds);
    await this.userRepository.save(user);

    // Revocar todos los refresh tokens
    await this.refreshTokenRepository.update(
      { user: { id: userId } },
      { isRevoked: true },
    );

    return { message: 'Password changed successfully' };
  }

  async validateOAuthLogin(oauthUser: {
    provider: string;
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }) {
    // Buscar usuario por provider y providerId
    let user = await this.userRepository.findOne({
      where: {
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
      },
      relations: ['roles'],
    });

    if (!user) {
      // Si no existe, buscar por email
      user = await this.userRepository.findOne({
        where: { email: oauthUser.email },
        relations: ['roles'],
      });

      if (user) {
        // Usuario existe con el mismo email pero diferente provider
        // Actualizar con datos de OAuth
        user.provider = oauthUser.provider;
        user.providerId = oauthUser.providerId;
        user.profilePicture = oauthUser.profilePicture;
        await this.userRepository.save(user);
      } else {
        // Crear nuevo usuario
        let userRole = await this.roleRepository.findOne({
          where: { name: RoleType.USER },
        });

        if (!userRole) {
          userRole = this.roleRepository.create({
            name: RoleType.USER,
            description: 'Usuario estándar',
          });
          await this.roleRepository.save(userRole);
        }

        // Generar username único basado en email
        const baseUsername = oauthUser.email.split('@')[0];
        let username = baseUsername;
        let counter = 1;
        
        while (await this.userRepository.findOne({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        user = this.userRepository.create({
          email: oauthUser.email,
          username,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
          profilePicture: oauthUser.profilePicture,
          password: null, // OAuth users don't have password
          isEmailVerified: true, // OAuth providers verify emails
          roles: [userRole],
          status: UserStatus.ACTIVE,
        });

        await this.userRepository.save(user);
      }
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generar tokens
    const tokens = await this.generateTokens(user);

    return {
      message: 'OAuth login successful',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  private async generateTokens(user: User, userAgent?: string, ipAddress?: string) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(role => role.name),
    };

    // Access Token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
    });

    // Refresh Token
    const refreshTokenValue = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    // Calcular fecha de expiración del refresh token (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Guardar refresh token en BD
    const refreshToken = this.refreshTokenRepository.create({
      token: refreshTokenValue,
      user: user,
      expiresAt: expiresAt,
      userAgent: userAgent,
      ipAddress: ipAddress,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
    };
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return {
      ...sanitized,
      roles: user.roles.map(role => role.name),
    };
  }
}
