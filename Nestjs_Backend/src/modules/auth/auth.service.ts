import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
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
  ) {}

  // ==========================================
  // 1. GOOGLE AUTHENTICATION
  // ==========================================

  async validateGoogleUser(googleProfile: any) {
    try {
      const { googleId, email, firstName, lastName, picture } = googleProfile;

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
            providerId: googleId,
            avatar: user.avatar || picture,
            emailVerified: true,
          },
        });
      } else {
        // Create new user
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
  // 2. EMAIL & PASSWORD AUTHENTICATION
  // ==========================================

  async register(dto: RegisterDto) {
    // 1. Check if email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Create User
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        provider: 'email',
        accountType: 'PERSONAL',
      },
    });

    // 4. Create Workspace
    await this.createDefaultWorkspace(user);

    // 5. Login
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    // 1. Find User
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Login
    return this.generateTokens(user);
  }

  // ==========================================
  // 3. PHONE / OTP AUTHENTICATION
  // ==========================================

  async sendOtp(phone: string) {
    // TODO: Add PhoneUtil.sanitize(phone) here later
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.otpVerification.upsert({
      where: { phone },
      update: { code: otp, expiresAt, attempts: 0 },
      create: { phone, code: otp, expiresAt },
    });

    // 🛑 LOG FOR DEV (In prod, send SMS via Orange/Twilio)
    console.log(`📲 [DEV OTP] Code for ${phone}: ${otp}`);

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
      // Create new Phone User
      user = await this.prisma.user.create({
        data: {
          phone,
          provider: 'phone',
          phoneVerified: true,
          firstName: 'Mobile User',
          accountType: 'PERSONAL',
        },
      });
      // CRITICAL: Create workspace for them too!
      await this.createDefaultWorkspace(user);
    } else {
      // Verify existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    // Cleanup OTP
    await this.prisma.otpVerification.delete({ where: { phone } });

    return this.generateTokens(user);
  }

  // ==========================================
  // 4. TOKEN MANAGEMENT
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
      this.jwtService.signAsync(payload, {
        secret: secret,
        expiresIn: '15m', 
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
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
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET') + '-refresh';

      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: secret,
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

      // Rotate: Delete old session
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
      await this.prisma.session.deleteMany({
        where: { userId, refreshToken },
      });
    } else {
      await this.prisma.session.deleteMany({
        where: { userId },
      });
    }

    return { message: 'Logged out successfully' };
  }

  // ==========================================
  // 5. HELPER FUNCTIONS
  // ==========================================

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
        ownedWorkspaces: {
          select: { id: true, name: true, slug: true }
        }
      },
    });
  }

  async createDefaultWorkspace(user: any) {
    if (!user || !user.id) {
      console.error('CreateWorkspace Error: User ID is missing', user);
      throw new InternalServerErrorException('Cannot create workspace: User ID missing');
    }

    const baseName = user.firstName || 'My';
    
    // Generate slug: "Steve" -> "steve-workspace-xyz"
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