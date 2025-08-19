import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import {
  AuthResponseDto,
  AuthTokensDto,
  UserDto,
} from './dto/auth-response.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId'),
    );
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
      provider: 'local',
      emailVerified: false,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.usersService.updateRefreshToken(
      (user as any)._id.toString(),
      tokens.refreshToken || null,
    );

    return {
      user: this.mapUserToDto(user),
      tokens,
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify user has password (not from Google OAuth)
    if (!user.password) {
      throw new BadRequestException('This user must sign in with Google');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account disabled');
    }

    // Update last login
    await this.usersService.updateLastLogin((user as any)._id.toString());

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.usersService.updateRefreshToken(
      (user as any)._id.toString(),
      tokens.refreshToken || null,
    );

    return {
      user: this.mapUserToDto(user),
      tokens,
      message: 'Login successful',
    };
  }

  async loginWithGoogle(
    googleAuthDto: GoogleAuthDto,
  ): Promise<AuthResponseDto> {
    const { credential, clientId } = googleAuthDto;

    try {
      // Verify token with Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new BadRequestException('Invalid Google token');
      }

      const {
        sub: googleId,
        email,
        name,
        picture,
        given_name,
        family_name,
        locale,
        email_verified,
      } = payload;

      // Find user existente por email o googleId
      let user =
        (await this.usersService.findByEmail(email || '')) ||
        (await this.usersService.findByGoogleId(googleId));

      if (user) {
        // Usuario existente - actualizar datos de Google si es necesario
        if (!user.googleId) {
          user = await this.usersService.updateGoogleData(
            (user as any)._id.toString(),
            {
              googleId,
              picture,
              givenName: given_name,
              familyName: family_name,
              locale,
              emailVerified: email_verified,
            },
          );
        }
      } else {
        // Crear nuevo usuario con datos de Google
        user = await this.usersService.create({
          email,
          name,
          googleId,
          picture,
          givenName: given_name,
          familyName: family_name,
          locale,
          emailVerified: email_verified,
          provider: 'google',
        });
      }

      // Update last login
      if (user) {
        await this.usersService.updateLastLogin((user as any)._id.toString());
      }

      // Verificar que el usuario existe
      if (!user) {
        throw new BadRequestException('Error processing Google data');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Save refresh token
      await this.usersService.updateRefreshToken(
        (user as any)._id.toString(),
        tokens.refreshToken || null,
      );

      return {
        user: this.mapUserToDto(user),
        tokens,
        message: 'Google login successful',
      };
    } catch (error) {
      throw new BadRequestException(
        'Error validating Google token: ' + error.message,
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // Find user
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token
      await this.usersService.updateRefreshToken(
        (user as any)._id.toString(),
        tokens.refreshToken || null,
      );

      return {
        user: this.mapUserToDto(user),
        tokens,
        message: 'Tokens refreshed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async getCurrentUser(userId: string): Promise<UserDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.mapUserToDto(user);
  }

  private async generateTokens(user: User): Promise<AuthTokensDto> {
    const payload = {
      sub: (user as any)._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hora en segundos
      tokenType: 'Bearer',
    };
  }

  private mapUserToDto(user: User): UserDto {
    return {
      id: (user as any)._id.toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
      given_name: user.givenName,
      family_name: user.familyName,
      locale: user.locale,
      verified_email: user.emailVerified,
      roles: user.roles,
    };
  }
}
