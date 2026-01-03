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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/phone-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto'; 

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  // ==========================================
  // GOOGLE AUTH
  // ==========================================

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  async googleAuth() {
    // Guard redirects to Google automatically.
    // Nothing in this function body executes.
  }

  @Get('google/redirect') 
  @UseGuards(GoogleAuthGuard)
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth callback endpoint' })
  async googleAuthCallback(@Req() req) {
    try {
      // req.user comes from GoogleStrategy.validate()
      const user = req.user;
      
      // Generate tokens
      const tokens = await this.authService.generateTokens(user);
      
      // Build Redirect URL
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
      
      // pass tokens, not the full user object
      // The frontend should use the token to fetch user details via /auth/profile
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
  // PHONE AUTH
  // ==========================================

  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.phone);
  }

  @Post('phone/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone OTP and login' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const user = await this.authService.verifyOtp(
      verifyOtpDto.phone,
      verifyOtpDto.code,
    );
    
    const tokens = await this.authService.generateTokens(user);
    
    return {
      ...tokens,
      message: 'Phone verified successfully',
    };
  }

  // ==========================================
  // TOKEN MANAGEMENT
  // ==========================================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req, @Body() dto: RefreshTokenDto) {
    // optionally pass refreshToken to kill that specific session
    // req.user.id comes from JwtAuthGuard
    return this.authService.logout(req.user['sub'], dto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req) {
    // req.user['sub'] is the userId from the JWT
    return this.authService.validateUserById(req.user['sub']);
  }
}