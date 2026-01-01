// src/modules/auth/services/auth.service.ts
import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  UnauthorizedException,
  Logger 
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from './jwt.service';
import { PhoneAuthService } from './phone-auth.service';
import { GoogleAuthService } from './google-auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { PhoneLoginDto, VerifyOtpDto } from '../dto/phone-login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly phoneAuthService: PhoneAuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password, firstName, lastName } = registerDto;

    // Validate required fields
    if (!email && !phone) {
      throw new BadRequestException('Email ou numéro de téléphone requis');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ],
    }
    });

    if (existingUser) {
      throw new BadRequestException('Email ou numéro de téléphone déjà utilisé');
    }

    // Hash password if provided
    const hashedPassword = password ? await this.jwtService.hashPassword(password) : null;

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: email || `temp-${Date.now()}@tchokos.com`,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        provider: email ? 'email' : 'phone',
        emailVerified: false,
        phoneVerified: false,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, phone, password } = loginDto;

    if (!email && !phone) {
      throw new BadRequestException('Email ou numéro de téléphone requis');
    }

    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Check password for non-OAuth users
    if (user.password && !(await this.jwtService.comparePassword(password, user.password))) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      tokens,
    };
  }

  async loginWithPhone(phoneLoginDto: PhoneLoginDto) {
    const { phone } = phoneLoginDto;

    // Send OTP
    const result = await this.phoneAuthService.sendOtp(phone);

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    // Create temporary user if doesn't exist
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          email: `temp-${phone}@tchokos.com`,
          provider: 'phone',
          phoneVerified: false,
        },
      });
    }

    return { 
      message: result.message,
      ...(result.otp && { otp: result.otp }) // Only include OTP in development
    };
  }

  async verifyPhoneOtp(verifyOtpDto: VerifyOtpDto) {
    const { phone, code } = verifyOtpDto;

    // Verify OTP
    await this.phoneAuthService.verifyOtp(phone, code);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          email: `verified-${phone}@tchokos.com`,
          provider: 'phone',
          phoneVerified: true,
        },
      });
    } else {
      // Update verification status
      user = await this.prisma.user.update({
        where: { phone },
        data: { phoneVerified: true },
      });
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        role: user.role,
      },
      tokens,
    };
  }

  async googleAuth(token: string) {
    return this.googleAuthService.authenticateWithGoogle(token);
  }

  async googleAuthCallback(userData: any) {
    try {
      const { email, firstName, lastName, picture, googleId } = userData;

      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { providerId: googleId }
          ]
        }
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            avatar: picture,
            provider: 'google',
            providerId: googleId,
            emailVerified: true,
            phone: `google-${googleId.slice(0, 10)}`,
            password: '',
          }
        });
      } else {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            firstName,
            lastName,
            avatar: picture,
            provider: 'google',
            providerId: googleId,
            emailVerified: true,
          }
        });
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      this.logger.error('Google auth callback error:', error);
      throw new BadRequestException('Erreur lors de l\'authentification Google');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        avatar: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            region: true,
            isDefault: true,
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async resendOtp(phone: string) {
    return this.phoneAuthService.resendOtp(phone);
  }

  async verifyEmail(token: string) {
    // Implémentation basique pour l'instant
    this.logger.log(`Email verification token: ${token}`);
    return { message: 'Email vérifié avec succès' };
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Pour la sécurité, ne pas révéler si l'email existe
      return { message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation' };
    }

    // Générer et envoyer token (à implémenter)
    this.logger.log(`Password reset requested for: ${email}`);
    
    return { message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation' };
  }

  async resetPassword(token: string, password: string) {
    // Vérifier token et réinitialiser (à implémenter)
    this.logger.log(`Password reset with token: ${token}`);
    
    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
      }
    });

    return user;
  }

  private generateTokens(user: any) {
    const accessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    const refreshToken = this.jwtService.generateRefreshToken({
      sub: user.id,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 heure
      tokenType: 'Bearer',
    };
  }
}