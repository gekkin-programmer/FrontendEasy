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
import { Throttle, SkipThrottle } from '@nestjs/throttler';
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
      // @ts-expect-error - req.user is added by Passport
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
  @Throttle({ default: { ttl: 3_600_000, limit: 5 } }) // 5 registrations per hour per IP
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
  @Throttle({ default: { ttl: 900_000, limit: 10 } }) // 10 attempts per 15 minutes per IP
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
  @SkipThrottle() // Authenticated route — no need to rate-limit
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current logged-in user details' })
  async getProfile(@Req() req: Request) {
    // @ts-expect-error req.user is added by Passport
    return this.authService.validateUserById(req.user.sub);
  }

  @Post('email/send-otp')
  @Throttle({ default: { ttl: 3_600_000, limit: 5 } }) // 5 OTP requests per hour per IP
  @ApiOperation({ summary: 'Send verification code to email' })
  async sendEmailOtp(@Body() body: { email: string }) {
    return this.authService.sendEmailOtp(body.email);
  }
}
