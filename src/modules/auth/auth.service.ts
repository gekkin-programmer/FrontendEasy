// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcryptjs';
// import { PrismaService } from '../../prisma/prisma.service';
// import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';

// @Injectable()
// export class AuthService {
//   constructor(
//     private prisma: PrismaService,
//     private jwtService: JwtService,
//   ) {}

//   async register(registerDto: RegisterDto) {
//     const { email, phone, password, firstName, lastName } = registerDto;

//     // Vérifier si l'utilisateur existe déjà
//     const existingUser = await this.prisma.user.findFirst({
//       where: {
//         OR: [{ email }, { phone }],
//       },
//     });

//     if (existingUser) {
//       throw new UnauthorizedException('Email ou téléphone déjà utilisé');
//     }

//     // Hasher le mot de passe
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Créer l'utilisateur
//     const user = await this.prisma.user.create({
//       data: {
//         email,
//         phone,
//         password: hashedPassword,
//         firstName,
//         lastName,
//         role: 'CUSTOMER',
//         status: 'ACTIVE',
//       },
//     });

//     // Générer le token JWT
//     const token = this.generateToken(user);

//     return {
//       user: {
//         id: user.id,
//         email: user.email,
//         phone: user.phone,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//       },
//       token,
//     };
//   }

//   async login(loginDto: LoginDto) {
//     const { email, password } = loginDto;

//     const user = await this.prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       throw new UnauthorizedException('Identifiants invalides');
//     }

//     if (user.status !== 'ACTIVE') {
//       throw new UnauthorizedException('Compte désactivé');
//     }

//     const token = this.generateToken(user);

//     return {
//       user: {
//         id: user.id,
//         email: user.email,
//         phone: user.phone,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//       },
//       token,
//     };
//   }

//   private generateToken(user: any) {
//     const payload = {
//       sub: user.id,
//       email: user.email,
//       role: user.role,
//     };

//     return this.jwtService.sign(payload);
//   }
// }