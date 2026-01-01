import { Injectable, BadRequestException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from './jwt.service';

interface GoogleTokenPayload {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}

@Injectable()
export class GoogleAuthService {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials missing');
    }
    
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async verifyGoogleToken(token: string): Promise<GoogleTokenPayload> {
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new BadRequestException('Token Google invalide - aucun payload');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
        email_verified: payload.email_verified,
      };
    } catch (error) {
      throw new BadRequestException('Token Google invalide');
    }
  }

  async authenticateWithGoogle(token: string) {
    const payload = await this.verifyGoogleToken(token);
    
    // Check if user exists with this Google ID
    let user = await this.prisma.user.findFirst({
      where: {
        provider: 'google',
        providerId: payload.sub,
      },
    });

    // If not, check by email
    if (!user && payload.email) {
      user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (user) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: payload.sub,
            emailVerified: true,
          },
        });
      }
    }

    // Create new user if doesn't exist
    if (!user) {
      const email = payload.email || `google-${payload.sub}@tchokos.com`;
      const firstName = payload.given_name || 'Google';
      const lastName = payload.family_name || 'User';
      const avatar = payload.picture || '';
      
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          avatar,
          provider: 'google',
          providerId: payload.sub,
          emailVerified: payload.email_verified || true,
          phone: `google-${payload.sub.slice(0, 10)}`,
          password: '',
        },
      });
    }

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.jwtService.generateRefreshToken({
      sub: user.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async googleAuthCallback(userData: any) {
    try {
      const { email, firstName, lastName, picture, googleId } = userData;

      if (!email || !googleId) {
        throw new BadRequestException('Données Google incomplètes');
      }

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
            firstName: firstName || 'Google',
            lastName: lastName || 'User',
            avatar: picture || '',
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
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            avatar: picture || user.avatar,
            provider: 'google',
            providerId: googleId,
            emailVerified: true,
          }
        });
      }

      // Generate tokens
      const accessToken = this.jwtService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = this.jwtService.generateRefreshToken({
        sub: user.id,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      console.error('Google auth callback error:', error);
      throw new BadRequestException('Erreur lors de l\'authentification Google');
    }
  }
}