import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
  Redirect,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/phone-login.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiQuery({
    name: 'workspaceId',
    required: false,
    description: 'Workspace ID to associate user with',
  })
  @ApiQuery({
    name: 'redirect',
    required: false,
    description: 'Frontend redirect URL after authentication',
  })
  @UseGuards(GoogleAuthGuard)
  async googleAuth(
    @Query('workspaceId') workspaceId?: string,
    @Query('redirect') redirect?: string,
  ) {
    // This route is handled by GoogleAuthGuard
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback endpoint' })
  @UseGuards(GoogleAuthGuard)
  @Redirect() // Will redirect to frontend
  async googleAuthCallback(@Req() req) {
    try {
      const user = req.user;
      const workspaceId = req.session?.workspaceId;
      
      // Generate tokens
      const tokens = await this.authService.generateTokens(user, workspaceId);
      
      // Redirect to frontend with tokens
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
      
      redirectUrl.searchParams.set('accessToken', tokens.accessToken);
      redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
      redirectUrl.searchParams.set('expiresIn', tokens.expiresIn.toString());
      redirectUrl.searchParams.set('user', JSON.stringify(tokens.user));
      
      return { url: redirectUrl.toString() };
    } catch (error) {
      // Redirect to frontend error page
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const errorUrl = new URL(`${frontendUrl}/auth/error`);
      
      errorUrl.searchParams.set('error', error.message);
      return { url: errorUrl.toString() };
    }
  }

  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req) {
    const refreshToken = req.body.refreshToken;
    return this.authService.logout(req.user.id, refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req) {
    return this.authService.validateUserById(req.user.id);
  }
}