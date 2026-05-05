import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../common/providers/email/email.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, Session } from '@prisma/client';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // ==========================================
  // HELPERS: ADMIN CHECK
  // ==========================================
  private readonly ADMIN_EMAILS = [
    'nkouambrayan@gmail.com',
    'brayannnkouam@gmail.com',
  ];

  private getRoleForEmail(email?: string): 'USER' | 'ADMIN' {
    if (!email) return 'USER';
    return this.ADMIN_EMAILS.includes(email.toLowerCase()) ? 'ADMIN' : 'USER';
  }

  // ==========================================
  // 1. GOOGLE AUTHENTICATION
  // ==========================================
  async validateGoogleUser(googleProfile: any) {
    try {
      const { googleId, email, firstName, lastName, picture } = googleProfile;

      let user = await this.prisma.user.findUnique({ where: { email } });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: googleId,
            avatar: user.avatar || picture,
            emailVerified: true,
            role: this.getRoleForEmail(email), // ➤ AUTO PROMOTION ON UPDATE
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email,
            firstName: firstName || 'User',
            lastName: lastName || '',
            avatar: picture,
            provider: 'google',
            providerId: googleId,
            emailVerified: true,
            accountType: 'PERSONAL',
            role: this.getRoleForEmail(email), // ➤ AUTO PROMOTION ON CREATE
          },
        });
        await this.createDefaultWorkspace(user);
      }
      return this.startSession(user);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error validating Google user');
    }
  }

  // ==========================================
  // 2. EMAIL REGISTER
  // ==========================================
  async register(dto: RegisterDto) {
    // 1. Verify OTP first — reject unverified registrations
    const otpRecord = await this.prisma.otpVerification.findUnique({
      where: { email: dto.email },
    });

    if (
      !otpRecord ||
      otpRecord.code !== dto.code ||
      otpRecord.expiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    // 2. Check for existing account
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException(
        'An account with this email already exists.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        provider: 'email',
        emailVerified: true,
        accountType: 'PERSONAL',
        role: this.getRoleForEmail(dto.email),
      },
    });

    // 3. Consume the OTP so it can't be reused
    await this.prisma.otpVerification.delete({ where: { email: dto.email } });
    await this.createDefaultWorkspace(user);

    return this.startSession(user);
  }

  // ==========================================
  // 3. LOGIN
  // ==========================================
  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.startSession(user, ipAddress, userAgent);
  }

  // ==========================================
  // 4. SESSION MANAGEMENT
  // ==========================================

  private async startSession(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tokens = await this.generateTokens(user);
    const rtHash = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: rtHash,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async refreshToken(
    oldRefreshToken: string,
    ipAddress: string,
    userAgent: string,
  ) {
    let payload;
    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
      payload = await this.jwtService.verifyAsync(oldRefreshToken, { secret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token signature');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const sessions = await this.prisma.session.findMany({
      where: { userId: user.id },
    });

    // Explicitly typed to allow null assignment initially
    let sessionToUpdate: Session | null = null;

    for (const session of sessions) {
      const isMatch = await bcrypt.compare(
        oldRefreshToken,
        session.refreshToken,
      );
      if (isMatch) {
        sessionToUpdate = session;
        break;
      }
    }

    if (!sessionToUpdate) {
      throw new ForbiddenException('Access Denied - Session not found');
    }

    await this.prisma.session.delete({ where: { id: sessionToUpdate.id } });

    return this.startSession(user, ipAddress, userAgent);
  }

  async logout(refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken);
    if (!decoded || !decoded.sub) return;

    const sessions = await this.prisma.session.findMany({
      where: { userId: decoded.sub },
    });

    for (const session of sessions) {
      if (await bcrypt.compare(refreshToken, session.refreshToken)) {
        await this.prisma.session.delete({ where: { id: session.id } });
        break;
      }
    }
    return { message: 'Logged out successfully' };
  }

  // ==========================================
  // 5. OTP / HELPERS
  // ==========================================

  async sendEmailOtp(email: string) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otpVerification.upsert({
      where: { email },
      update: { code: otp, expiresAt },
      create: { email, code: otp, expiresAt },
    });

    await this.emailService.sendOtp(email, otp);
    return { message: 'OTP sent to email' };
  }

  async sendOtp(phone: string) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otpVerification.upsert({
      where: { phone },
      update: { code: otp, expiresAt },
      create: { phone, code: otp, expiresAt },
    });

    console.log(`📲 [DEV OTP] Code for ${phone}: ${otp}`);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phone: string, code: string) {
    const otpRecord = await this.prisma.otpVerification.findUnique({
      where: { phone },
    });

    if (
      !otpRecord ||
      otpRecord.code !== code ||
      otpRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          provider: 'phone',
          phoneVerified: true,
          firstName: 'Mobile User',
          accountType: 'PERSONAL',
        },
      });
      await this.createDefaultWorkspace(user);
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    await this.prisma.otpVerification.delete({ where: { phone } });
    return this.startSession(user);
  }

  // ==========================================
  // 6. FORGOT / RESET PASSWORD
  // ==========================================

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return the same message to prevent email enumeration
    if (!user || !user.password) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const exp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetTokenExp: exp },
    });

    await this.emailService.sendPasswordReset(email, token);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: token },
    });

    if (
      !user ||
      !user.passwordResetTokenExp ||
      user.passwordResetTokenExp < new Date()
    ) {
      throw new BadRequestException('Reset link is invalid or has expired.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetTokenExp: null,
      },
    });

    return { message: 'Password updated successfully.' };
  }

  async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      accountType: user.accountType,
      role: user.role,
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: secret, expiresIn: '1d' }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        accountType: user.accountType,
      },
    };
  }

  async createDefaultWorkspace(user: any) {
    if (!user || !user.id) return;
    const baseName = user.firstName || 'My';
    const slug = `${baseName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${crypto.randomBytes(4).toString('hex')}`;

    const workspace = await this.prisma.workspace.create({
      data: {
        name: `${baseName}'s Workspace`,
        slug: slug,
        ownerId: user.id,
      },
    });

    await this.prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    });
    return workspace;
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
        ownedWorkspaces: { select: { id: true, name: true, slug: true } },
      },
    });
  }
  async validateUserByToken(token: string) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      console.log('🔹 validateUserByToken payload:', payload);

      // We check if user exists in DB to be safe
      return this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
    } catch (e) {
      console.error('❌ validateUserByToken failed:', e.message);
      return null;
    }
  }
}
