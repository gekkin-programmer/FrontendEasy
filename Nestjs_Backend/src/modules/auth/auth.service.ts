import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException, 
  InternalServerErrorException,
  ForbiddenException
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
  private readonly ADMIN_EMAILS: string[];

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.ADMIN_EMAILS = (configService.get<string>('ADMIN_EMAILS') || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }

  // ==========================================
  // HELPERS: ADMIN CHECK
  // ==========================================

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
    // ... logic remains same ...
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
        role: this.getRoleForEmail(dto.email), // ➤ AUTO PROMOTION ON REGISTER
      },
    });

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
  
  private async startSession(user: User, ipAddress?: string, userAgent?: string) {
    const tokens = await this.generateTokens(user);
    const rtHash = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: rtHash,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    return tokens;
  }

  async refreshToken(oldRefreshToken: string, ipAddress: string, userAgent: string) {
    let payload;
    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
      payload = await this.jwtService.verifyAsync(oldRefreshToken, { secret });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token signature');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');

    const sessions = await this.prisma.session.findMany({ where: { userId: user.id } });
    
    // Explicitly typed to allow null assignment initially
    let sessionToUpdate: Session | null = null;

    for (const session of sessions) {
      const isMatch = await bcrypt.compare(oldRefreshToken, session.refreshToken);
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
     const decoded = this.jwtService.decode(refreshToken) as any;
     if(!decoded || !decoded.sub) return;

     const sessions = await this.prisma.session.findMany({ where: { userId: decoded.sub } });
     
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
    const otpRecord = await this.prisma.otpVerification.findUnique({ where: { phone } });

    if (!otpRecord || otpRecord.code !== code || otpRecord.expiresAt < new Date()) {
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

  async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      accountType: user.accountType,
      role: user.role,
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    const accessExpiry  = (this.configService.get<string>('JWT_EXPIRATION')          || '1d') as any;
    const refreshExpiry = (this.configService.get<string>('JWT_REFRESH_EXPIRATION')  || '7d') as any;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: secret!,        expiresIn: accessExpiry }),
      this.jwtService.signAsync(payload, { secret: refreshSecret!, expiresIn: refreshExpiry }),
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
        id: true, email: true, firstName: true, lastName: true, avatar: true,
        accountType: true, emailVerified: true, phoneVerified: true, status: true,
        ownedWorkspaces: { select: { id: true, name: true, slug: true } }
      },
    });
  }
    async validateUserByToken(token: string) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      console.log("🔹 validateUserByToken payload:", payload);

      // We check if user exists in DB to be safe
      return this.prisma.user.findUnique({ 
        where: { id: payload.sub } 
      });
    } catch (e) {
      console.error("❌ validateUserByToken failed:", e.message);
      return null;
    }
  }
}