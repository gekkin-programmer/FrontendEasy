// import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// import { AuthService } from './auth.service';
// import { RegisterDto } from './dto/register.dto';
// import { LoginDto } from './dto/login.dto';


// @ApiTags('Authentication')
// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('register')
//   @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
//   @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
//   @ApiResponse({ status: 400, description: 'Données invalides' })
//   async register(@Body() registerDto: RegisterDto) {
//     return this.authService.register(registerDto);
//   }

//   @Post('login')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Connexion utilisateur' })
//   @ApiResponse({ status: 200, description: 'Connexion réussie' })
//   @ApiResponse({ status: 401, description: 'Identifiants invalides' })
//   async login(@Body() loginDto: LoginDto) {
//     return this.authService.login(loginDto);
//   }
// }