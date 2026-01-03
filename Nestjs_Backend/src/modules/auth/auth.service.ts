import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { GoogleProfile } from './interfaces/google-profile.interface';
import { TokenPayload } from './interfaces/token-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateGoogleUser(profile: GoogleProfile) {
    const { sub, email, given_name, family_name, picture, email_verified } = profile;

    // Check if user exists with this email
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Update existing user with Google info
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'google',
          providerId: sub,
          avatar: picture || user.avatar,
          emailVerified: true,
          firstName: given_name,
          lastName: family_name,
        },
      });
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: given_name,
          lastName: family_name,
          avatar: picture,
          provider: 'google',
          providerId: sub,
          emailVerified: email_verified,
          accountType: 'PERSONAL',
        },
      });

      // Create default workspace for new user
      await this.createDefaultWorkspace(user.id);
    }

    return user;
  } catch (error) {
    throw new UnauthorizedException('Invalid Google credentials');
  }
  

    async createDefaultWorkspace(user: any) {
    // Generating a friendly slug: "Steve" -> "Steve-workspace"
    const baseSlug = (user.firstName + '-' + (user.lastName || ''))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') 
      .replace(/-+/g, '-'); 
    
    // random string to ensure uniqueness
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const workspace = await this.prisma.workspace.create({
      data: {
        name: `${user.firstName}'s Workspace`,
        slug: slug,
        ownerId: user.id,
      },
    });
        await this.prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'OWNER',
        status: 'ACTIVE'
      },
    });

    return workspace;
  }

    async generateTokens(user: any, workspaceId?: string): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      accountType: user.accountType,
      workspaceId, 
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m', 
      }),
      this.jwtService.signAsync(payload, {
        // different secret for refresh tokens in .env
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET') + '-refresh',
        expiresIn: '7d', 
      }),
    ]);

    // Store refresh token in database
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
        userAgent: 'Unknown', 
        ipAddress: '0.0.0.0'  
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, 
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        accountType: user.accountType,
        emailVerified: user.emailVerified,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') + '-refresh',
      });

      // Check if refresh token exists in database
      const session = await this.prisma.session.findFirst({
        where: {
          userId: payload.sub,
          refreshToken,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!session) {
        throw new BadRequestException('Invalid refresh token');
      }

      // Delete old session
      await this.prisma.session.delete({
        where: { id: session.id },
      });

      // Generate new tokens
      return this.generateTokens(session.user, payload.workspaceId);
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Delete specific session
      await this.prisma.session.deleteMany({
        where: {
          userId,
          refreshToken,
        },
      });
    } else {
      // Delete all user sessions
      await this.prisma.session.deleteMany({
        where: { userId },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async validateUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        accountType: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
      },
    });
  }

  async sendOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpVerification.upsert({
      where: { phone },
      update: { code: otp, expiresAt, attempts: 0 },
      create: { phone, code: otp, expiresAt },
    });

    // Here you would integrate with SMS service like Twilio
    // await this.smsService.sendOtp(phone, otp);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phone: string, code: string) {
    const otpRecord = await this.prisma.otpVerification.findUnique({
      where: { phone },
    });

    if (!otpRecord || otpRecord.code !== code || otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          provider: 'phone',
          phoneVerified: true,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    // Delete OTP after successful verification
    await this.prisma.otpVerification.delete({ where: { phone } });

    return user;
  }
}