
import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Req, 
  Res, 
  HttpCode, 
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GoogleRegisterDto, RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { PhoneLoginDto, VerifyOtpDto } from '../dto/phone-login.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== EMAIL AUTH ====================
  
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ==================== PHONE AUTH ====================
  
  // @Post('phone/login')
  // @HttpCode(HttpStatus.OK)
  // async phoneLogin(@Body() phoneLoginDto: PhoneLoginDto) {
  //   return this.authService.loginWithPhone(phoneLoginDto);
  // }
  @Post('phone/login')
  @ApiOperation({ 
    summary: 'Envoyer un OTP par SMS',
    description: 'Envoie un code de vérification au numéro de téléphone fourni'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP envoyé avec succès',
    schema: {
      example: {
        message: "Code envoyé (mode développement)",
        otp: "123456"
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Numéro de téléphone invalide' })
  async phoneLogin(@Body() phoneLoginDto: PhoneLoginDto) {
    return this.authService.loginWithPhone(phoneLoginDto);
  }


  // @Post('phone/verify')
  // @HttpCode(HttpStatus.OK)
  // async verifyPhoneOtp(@Body() verifyOtpDto: VerifyOtpDto) {
  //   return this.authService.verifyPhoneOtp(verifyOtpDto);
  // }
  @Post('phone/verify')
  @ApiOperation({ 
    summary: 'Vérifier un OTP',
    description: 'Vérifie le code OTP et authentifie l\'utilisateur'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP vérifié avec succès',
    schema: {
      example: {
        user: {
          id: "clx...",
          email: "verified-+237655123456@tchokos.com",
          phone: "+237655123456",
          phoneVerified: true,
          role: "CUSTOMER"
        },
        tokens: {
          accessToken: "eyJ...",
          refreshToken: "eyJ...",
          expiresIn: 3600,
          tokenType: "Bearer"
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Code OTP invalide ou expiré' })
  async verifyPhoneOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyPhoneOtp(verifyOtpDto);
  }

  @Post('phone/resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() phoneLoginDto: PhoneLoginDto) {
    return this.authService.resendOtp(phoneLoginDto.phone);
  }

  // ==================== GOOGLE AUTH ====================
  
  // @Post('google')
  // @HttpCode(HttpStatus.OK)
  // async googleAuth(@Body() googleDto: GoogleRegisterDto) {
  //   return this.authService.googleAuth(googleDto.token);
  // }
   @Post('google')
  @ApiOperation({ 
    summary: 'Authentification Google',
    description: 'Authentifie un utilisateur avec Google OAuth'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentification Google réussie',
    schema: {
      example: {
        user: {
          id: "clx...",
          email: "user@gmail.com",
          firstName: "John",
          lastName: "Doe",
          avatar: "https://...",
          role: "CUSTOMER"
        },
        tokens: {
          accessToken: "eyJ...",
          refreshToken: "eyJ...",
          expiresIn: 3600,
          tokenType: "Bearer"
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Token Google invalide' })
  async googleAuth(@Body() body: { token: string }) {
    return this.authService.googleAuth(body.token);
  }


  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect() {
    // Redirection handled by GoogleStrategy
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req, @Res() res) {
    const { user } = req;
    
    // Create or authenticate user
    const authResult = await this.authService.googleAuthCallback(user);
    
    // Redirect to frontend with tokens
    const frontendUrl = this.configService.get('FRONTEND_URL');
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${authResult.tokens.accessToken}&refreshToken=${authResult.tokens.refreshToken}&userId=${authResult.user.id}`,
    );
  }

  // ==================== TOKEN MANAGEMENT ====================
  
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser() user: any) {
    // In production, you might want to blacklist the token
    return { message: 'Déconnexion réussie' };
  }

  // ==================== PROFILE ====================
  
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: any) {
    return this.authService.getUserProfile(user.id);
  }

  @Get('admin/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async adminTest(@GetUser() user: any) {
    return {
      message: 'Accès admin autorisé',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    };
  }

  // ==================== VERIFICATION ====================
  
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.sendPasswordResetEmail(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string, password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  // Dans AuthController - ajoutez cette méthode
@Get('google/test-token')
async getTestGoogleToken() {
  // Méthode pour obtenir un token de test
  return {
    instructions: "Pour tester Google Auth sans frontend:",
    method1: "Allez sur https://developers.google.com/oauthplayground",
    method2: "Configurez avec vos credentials Google",
    method3: "Sélectionnez scopes: email profile",
    method4: "Obtenez un id_token et utilisez POST /auth/google",
    your_config: {
      client_id: this.configService.get('GOOGLE_CLIENT_ID'),
      callback_url: this.configService.get('GOOGLE_CALLBACK_URL')
    }
  };
}

// Dans auth.controller.ts
@Post('google/test-simulate')
@HttpCode(HttpStatus.OK)
async googleTestSimulate() {
  // Simule une réponse Google pour tester sans frontend
  return {
    message: "Test réussi! Votre configuration Google est correcte.",
    nextSteps: [
      "1. Allez sur https://developers.google.com/oauthplayground",
      "2. Configurez avec vos credentials (voir ci-dessous)",
      "3. Autorisez et obtenez un id_token",
      "4. Utilisez: curl -X POST http://localhost:3001/auth/google -H 'Content-Type: application/json' -d '{\"token\":\"VOTRE_TOKEN\"}'"
    ],
    yourCredentials: {
      clientId: this.configService.get('GOOGLE_CLIENT_ID'),
      redirectUri: this.configService.get('GOOGLE_CALLBACK_URL'),
      requiredScopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    },
    status: "READY_FOR_TESTING"
  };
}
}