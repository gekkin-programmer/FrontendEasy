import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../common/providers/email/email.service';
import * as bcrypt from 'bcryptjs';

// DTOs
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

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
          },
        });
        await this.createDefaultWorkspace(user);
      }
      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error validating Google user');
    }
  }

  // ==========================================
  // 2. EMAIL REGISTER (WITH OTP CHECK)
  // ==========================================
  async register(dto: RegisterDto) {
    //  Verify the OTP Code first!
    // We look for the OTP record associated with this email
    const otpRecord = await this.prisma.otpVerification.findUnique({
      where: { email: dto.email }
    });

    // Check if record exists, matches code, and hasn't expired
    if (!otpRecord || otpRecord.code !== dto.code || new Date() > otpRecord.expiresAt) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    //  Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    // 3. Create User
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
      },
    });

    // 4. Cleanup: Delete the used OTP so it can't be reused
    await this.prisma.otpVerification.delete({ where: { email: dto.email } });

    // 5. Create Workspace
    await this.createDefaultWorkspace(user);

    // 6. Login
    return this.generateTokens(user);
  }

  // ==========================================
  // 3. LOGIN
  // ==========================================
  async login(dto: LoginDto) {
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

    return this.generateTokens(user);
  }

  // ==========================================
  // 4. SEND EMAIL OTP
  // ==========================================
  async sendEmailOtp(email: string) {
    // Check if user already exists (optional, depends if you allow re-registering)
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use. Please login.');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Upsert (Create or Update) OTP
    await this.prisma.otpVerification.upsert({
      where: { email },
      update: { code: otp, expiresAt },
      create: { email, code: otp, expiresAt },
    });

    // Send via Email Service
    await this.emailService.sendOtp(email, otp); 

    return { message: 'OTP sent to email' };
  }

  // ==========================================
  // 5. PHONE OTP
  // ==========================================
  async sendOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
    return this.generateTokens(user);
  }

  // ==========================================
  // 6. TOKEN & HELPERS
  // ==========================================
  async generateTokens(user: any, workspaceId?: string): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      accountType: user.accountType,
      workspaceId, 
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || secret + '-refresh';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: secret, expiresIn: '4h' }),
      this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 14400, 
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
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET') + '-refresh';
      const payload = await this.jwtService.verifyAsync(refreshToken, { secret });

      // In stateless JWT, we usually just verify signature. 
      // If you are tracking sessions in DB, validate here.
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();

      return this.generateTokens(user);
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    // If using DB sessions table, delete here.
    return { message: 'Logged out successfully' };
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

  async createDefaultWorkspace(user: any) {
    if (!user || !user.id) {
      throw new InternalServerErrorException('Cannot create workspace: User ID missing');
    }
    const baseName = user.firstName || 'My';
    const cleanName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const slug = `${cleanName}-workspace-${Math.random().toString(36).substring(2, 6)}`;

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
}