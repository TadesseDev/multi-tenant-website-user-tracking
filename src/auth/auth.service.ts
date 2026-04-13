import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.tenantId, user.role);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload: { sub: string; type: string } = this.jwtService.verify(
        refreshToken,
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        },
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find tokens for this user
      const storedTokens = await this.prisma.refreshToken.findMany({
        where: { userId: payload.sub, revokedAt: null },
        include: { user: true },
      });

      // Check if the provided token matches any stored (hashed) token and is not revoked
      let matchedToken = null;
      for (const token of storedTokens) {
        if (await bcrypt.compare(refreshToken, token.token)) {
          matchedToken = token;
          break;
        }
      }

      if (!matchedToken) {
        throw new UnauthorizedException('Token has been revoked');
      }

      if (new Date() > matchedToken.expiresAt) {
        throw new UnauthorizedException('Token has expired');
      }

      // Revoke old token
      await this.prisma.refreshToken.update({
        where: { id: matchedToken.id },
        data: { revokedAt: new Date() },
      });

      // Generate new tokens
      return this.generateTokens(
        matchedToken.user.id,
        matchedToken.user.tenantId,
        matchedToken.user.role,
      );
    } catch (error: unknown) {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  async logout(token: string): Promise<void> {
    const tokenPayload: { sub: string } = await this.jwtService.verify(token, {
      secret: this.configService.get<string>('jwt.secret'),
    });
    const userId = tokenPayload.sub;

    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  private async generateTokens(
    userId: string,
    tenantId: string,
    role: string,
  ): Promise<AuthResponseDto> {
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        tenantId,
        role,
        type: 'access',
      },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<number>('jwt.accessTokenExpiration'),
      },
    );

    const refreshTokenExpiry = new Date();
    const refreshTokenExpirationSeconds = this.configService.get<number>(
      'jwt.refreshTokenExpiration',
    );
    const refreshTokenExpirationInDays = Math.ceil(
      (refreshTokenExpirationSeconds || 604800) / (60 * 60 * 24),
    );
    refreshTokenExpiry.setDate(
      refreshTokenExpiry.getDate() + refreshTokenExpirationInDays,
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        tenantId,
        role,
        type: 'refresh',
      },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<number>('jwt.refreshTokenExpiration'),
      },
    );

    // Store hashed refresh token in DB
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt: refreshTokenExpiry,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
