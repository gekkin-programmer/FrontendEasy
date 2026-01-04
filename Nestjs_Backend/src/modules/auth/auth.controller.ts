import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Redirect,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

// Services & Guards
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// DTOs
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto'; 
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

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
  @Redirect()
  @ApiOperation({ summary: 'Step 2: Google Callback (Handle Redirect)' })
  async googleAuthCallback(@Req() req) {
    try {
      const googleProfile = req.user;
      
      // 1. Validate & Create/Update User in DB
      const dbUser = await this.authService.validateGoogleUser(googleProfile);
      
      // 2. Generate Tokens
      const tokens = await this.authService.generateTokens(dbUser);
      
      // 3. Build Redirect URL for Frontend
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
      
      // Pass tokens in URL (Frontend will strip them and save to localStorage)
      redirectUrl.searchParams.set('accessToken', tokens.accessToken);
      redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
      
      return { url: redirectUrl.toString() };
    } catch (error) {
      console.error('Google Auth Error:', error);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      return { url: `${frontendUrl}/login?error=auth_failed` };
    }
  }

  // ==========================================
  // 2. EMAIL & PASSWORD AUTH
  // ==========================================

  @Post('register')
  @ApiOperation({ summary: 'Register with Email & Password' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Email & Password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ==========================================
  // 3. PHONE / OTP AUTH
  // ==========================================

  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 1: Send OTP to phone' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('phone/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 2: Verify OTP and Login' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.code);
  }

  // ==========================================
  // 4. TOKEN MANAGEMENT
  // ==========================================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get new Access Token using Refresh Token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout (Kill Session)' })
  async logout(@Req() req, @Body() dto: RefreshTokenDto) {
    return this.authService.logout(req.user['sub'], dto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current logged-in user details' })
  async getProfile(@Req() req) {
    return this.authService.validateUserById(req.user['sub']);
  }
}