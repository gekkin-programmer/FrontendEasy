import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Ip,
} from '@nestjs/common';
import { createHmac } from 'crypto';
// ➤ FIX: Add 'type' keyword here for Express interfaces
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

// Services & Guards
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// DTOs (Keep these as regular imports because they are Classes)
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/otp.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  // Helper to set Secure Cookie
  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  // ==========================================
  // 1. GOOGLE AUTH
  // ==========================================

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Step 1: Redirect to Google Login' })
  async googleAuth() {
    // Guard redirects automatically
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Step 2: Google Callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      // 1. Validate & Start Session
      // @ts-ignore - req.user is added by Passport
      const { accessToken, refreshToken } =
        await this.authService.validateGoogleUser(req.user);

      // 2. Set Refresh Token in Cookie (Secure!)
      this.setRefreshCookie(res, refreshToken);

      // 3. Build Redirect URL for Frontend
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';

      res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}`);
    } catch (error) {
      console.error('Google Auth Error:', error);
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }

  // ==========================================
  // 2. EMAIL & PASSWORD AUTH
  // ==========================================

  @Post('register')
  @ApiOperation({ summary: 'Register with Email & Password' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      user: tokens.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Email & Password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const tokens = await this.authService.login(dto, ip, userAgent);

    this.setRefreshCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      user: tokens.user,
    };
  }

  // ==========================================
  // 3. PHONE / OTP AUTH
  // ==========================================

  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  // ==========================================
  // 4. TOKEN MANAGEMENT (Secure)
  // ==========================================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get new Access Token using Cookie' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    // 1. Get from Cookie
    const oldRefreshToken = req.cookies['refreshToken'];
    if (!oldRefreshToken)
      throw new BadRequestException('No refresh token provided');

    const userAgent = req.headers['user-agent'] || 'unknown';

    // 2. Service handles rotation
    const tokens = await this.authService.refreshToken(
      oldRefreshToken,
      ip,
      userAgent,
    );

    // 3. Set NEW Cookie (Rotation)
    this.setRefreshCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout (Kill Session)' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear Cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current logged-in user details' })
  async getProfile(@Req() req: Request) {
    // @ts-ignore
    return req.user;
  }

  @Post('email/send-otp')
  @ApiOperation({ summary: 'Send verification code to email' })
  async sendEmailOtp(@Body() body: { email: string }) {
    return this.authService.sendEmailOtp(body.email);
  }

  // ==========================================
  // 5. PASSWORD RESET
  // ==========================================

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password using the reset token' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  // ==========================================
  // 6. META DATA DELETION CALLBACK
  // ==========================================

  @Post('facebook/data-deletion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Meta signed data deletion callback' })
  async facebookDataDeletion(@Body() body: Record<string, string>, @Req() req: Request) {
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET') || '';
    const signedRequest = body.signed_request ?? (req.body as Record<string, string>)?.signed_request;

    if (!signedRequest) {
      return { status: 'error', message: 'Missing signed_request' };
    }

    try {
      const [encodedSig, payload] = signedRequest.split('.');

      const b64decode = (s: string) =>
        Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

      const sig = b64decode(encodedSig);
      const data = JSON.parse(b64decode(payload).toString('utf-8')) as { user_id?: string };

      const expected = createHmac('sha256', appSecret).update(payload).digest();
      if (!sig.equals(expected)) {
        return { status: 'error', message: 'Invalid signature' };
      }

      const confirmationCode = `del_${data.user_id ?? 'unknown'}_${Date.now()}`;
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://eazypost.cm';

      return {
        url: `${frontendUrl}/legal/data-deletion?code=${confirmationCode}`,
        confirmation_code: confirmationCode,
      };
    } catch {
      return { status: 'error', message: 'Failed to process deletion request' };
    }
  }
}
