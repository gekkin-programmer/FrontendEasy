// import { Injectable, BadRequestException, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PrismaService } from '../../../prisma/prisma.service';
// // import { TermiiSmsService } from './termii-sms.service';
// import { CameroonPhoneInfo } from '../interfaces/auth.interface';
// import { TermiiSmsService } from './termii-sms.service';

// @Injectable()
// export class PhoneAuthService {
//   private readonly logger = new Logger(PhoneAuthService.name);

//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly configService: ConfigService,
//     private readonly termiiSmsService: TermiiSmsService,
//   ) {}

//   /**
//    * Validate Cameroon phone number
//    */
//   private validateCameroonPhone(phone: string): CameroonPhoneInfo {
//     // Remove all non-digit characters
//     const digits = phone.replace(/\D/g, '');
    
//     let formatted = digits;
    
//     // Format: 237XXXXXXXXX
//     if (digits.startsWith('237') && digits.length === 12) {
//       formatted = digits;
//     } else if (digits.startsWith('0') && digits.length === 10) {
//       formatted = '237' + digits.substring(1);
//     } else if (digits.startsWith('6') && digits.length === 9) {
//       formatted = '237' + digits;
//     } else if (digits.startsWith('+237') && digits.length === 13) {
//       formatted = digits.substring(1);
//     } else {
//       throw new BadRequestException('Format de numéro invalide. Exemples: +2376XXXXXXXX, 6XXXXXXXX, 06XXXXXXXX');
//     }

//     // Detect operator
//     const prefix = formatted.substring(3, 6);
//     const mtnPrefixes = ['655', '656', '657', '658', '659', '680', '681', '682'];
//     const orangePrefixes = ['690', '691', '692', '693', '694', '695', '696', '697'];
//     const nexttelPrefixes = ['660', '661', '662', '663', '664'];

//     let operator: 'MTN' | 'ORANGE' | 'NEXTTEL' | 'UNKNOWN' = 'UNKNOWN';
//     if (mtnPrefixes.includes(prefix)) operator = 'MTN';
//     else if (orangePrefixes.includes(prefix)) operator = 'ORANGE';
//     else if (nexttelPrefixes.includes(prefix)) operator = 'NEXTTEL';

//     return {
//       formatted: `+${formatted}`,
//       operator,
//       isValid: operator !== 'UNKNOWN',
//     };
//   }

//   /**
//    * Generate 6-digit OTP
//    */
//   private generateOtp(): string {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   }

//   /**
//    * Send OTP to phone number
//    */
//   async sendOtp(phone: string): Promise<{ message: string; otp?: string }> {
//     try {
//       // Validate and format phone
//       const phoneInfo = this.validateCameroonPhone(phone);
      
//       if (!phoneInfo.isValid) {
//         this.logger.warn(`Numéro ${phone} détecté comme invalide (opérateur: ${phoneInfo.operator})`);
//         // You can decide to still send or throw error
//         // throw new BadRequestException(`Numéro ${phone} n'appartient pas à un opérateur camerounais reconnu`);
//       }

//       // Generate OTP
//       const otp = this.generateOtp();
//       const expiresAt = new Date();
//       expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes validity

//       // Store in database
//       await this.prisma.otpVerification.upsert({
//         where: { phone: phoneInfo.formatted },
//         update: {
//           code: otp,
//           expiresAt,
//           attempts: 0,
//           createdAt: new Date(),
//         },
//         create: {
//           phone: phoneInfo.formatted,
//           code: otp,
//           expiresAt,
//         },
//       });

//       // Send via Termii
//       const smsSent = await this.termiiSmsService.sendOtp(phoneInfo.formatted, otp);
      
//       if (!smsSent) {
//         throw new BadRequestException('Échec d\'envoi du SMS. Veuillez réessayer.');
//       }

//       this.logger.log(`OTP envoyé à ${phoneInfo.formatted} (${phoneInfo.operator})`);

//       // In development, also log OTP to console
//       if (this.configService.get('NODE_ENV') !== 'production') {
//         return { 
//           message: 'OTP envoyé avec succès (mode développement)',
//           otp // Only return OTP in development!
//         };
//       }

//       return { message: 'Code de vérification envoyé par SMS' };
//     } catch (error) {
//       this.logger.error(`Erreur envoi OTP à ${phone}:`, error.message);
      
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
      
//       throw new BadRequestException(
//         'Impossible d\'envoyer le code de vérification. Veuillez vérifier le numéro et réessayer.'
//       );
//     }
//   }

//   /**
//    * Verify OTP
//    */
//   async verifyOtp(phone: string, code: string): Promise<boolean> {
//     try {
//       const phoneInfo = this.validateCameroonPhone(phone);
      
//       const otpRecord = await this.prisma.otpVerification.findUnique({
//         where: { phone: phoneInfo.formatted },
//       });

//       if (!otpRecord) {
//         throw new BadRequestException('Aucun code de vérification envoyé à ce numéro');
//       }

//       if (otpRecord.attempts >= 3) {
//         await this.prisma.otpVerification.delete({ where: { phone: phoneInfo.formatted } });
//         throw new BadRequestException('Trop de tentatives. Veuillez demander un nouveau code');
//       }

//       if (new Date() > otpRecord.expiresAt) {
//         await this.prisma.otpVerification.delete({ where: { phone: phoneInfo.formatted } });
//         throw new BadRequestException('Code expiré. Veuillez demander un nouveau code');
//       }

//       if (otpRecord.code !== code) {
//         // Increment attempts
//         await this.prisma.otpVerification.update({
//           where: { phone: phoneInfo.formatted },
//           data: { attempts: otpRecord.attempts + 1 },
//         });
        
//         const remainingAttempts = 3 - (otpRecord.attempts + 1);
//         throw new BadRequestException(
//           `Code incorrect. Il vous reste ${remainingAttempts} tentative(s)`
//         );
//       }

//       // Delete OTP after successful verification
//       await this.prisma.otpVerification.delete({
//         where: { phone: phoneInfo.formatted },
//       });

//       this.logger.log(`OTP vérifié avec succès pour ${phoneInfo.formatted}`);
//       return true;
//     } catch (error) {
//       this.logger.error(`Erreur vérification OTP pour ${phone}:`, error.message);
//       throw error;
//     }
//   }

//   /**
//    * Resend OTP
//    */
//   async resendOtp(phone: string): Promise<{ message: string }> {
//     // Delete any existing OTP
//     try {
//       const phoneInfo = this.validateCameroonPhone(phone);
      
//       await this.prisma.otpVerification.deleteMany({
//         where: { phone: phoneInfo.formatted },
//       });
//     } catch (error) {
//       // Ignore if no record exists
//     }

//     return this.sendOtp(phone);
//   }

//   /**
//    * Check if phone number is valid and get operator info
//    */
//   async validatePhone(phone: string): Promise<CameroonPhoneInfo> {
//     return this.validateCameroonPhone(phone);
//   }

//   /**
//    * Get OTP status
//    */
//   async getOtpStatus(phone: string) {
//     try {
//       const phoneInfo = this.validateCameroonPhone(phone);
      
//       const otpRecord = await this.prisma.otpVerification.findUnique({
//         where: { phone: phoneInfo.formatted },
//       });

//       if (!otpRecord) {
//         return { exists: false };
//       }

//       const now = new Date();
//       const expiresIn = Math.max(0, Math.floor((otpRecord.expiresAt.getTime() - now.getTime()) / 1000));

//       return {
//         exists: true,
//         attempts: otpRecord.attempts,
//         expiresIn,
//         isExpired: expiresIn <= 0,
//       };
//     } catch (error) {
//       return { exists: false, error: error.message };
//     }
//   }
// }

// src/modules/auth/services/phone-auth.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PhoneAuthService {
  private readonly logger = new Logger(PhoneAuthService.name);
  
  // Tableau temporaire pour stocker les OTP (en développement)
  private otpStore: Map<string, { code: string; expiresAt: Date }> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(phone: string): Promise<{ message: string; otp?: string }> {
    try {
      // Format simple pour test
      const formattedPhone = phone.replace(/\D/g, '');
      
      // Générer OTP simple
      const otp = '123456'; // Toujours 123456 pour le développement
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      // Stocker en mémoire (pas en base)
      this.otpStore.set(formattedPhone, { code: otp, expiresAt });
      
      // Log pour développement
      this.logger.log(`[DEV OTP] Pour ${phone}: ${otp} (expire: ${expiresAt.toLocaleTimeString()})`);
      
      return {
        message: 'Code envoyé (mode développement)',
        otp: otp
      };
    } catch (error) {
      this.logger.error(`Erreur OTP: ${error.message}`);
      return {
        message: 'Code envoyé (mode développement)',
        otp: '123456' // Toujours retourner 123456
      };
    }
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const formattedPhone = phone.replace(/\D/g, '');
    const stored = this.otpStore.get(formattedPhone);
    
    if (!stored) {
      throw new BadRequestException('Aucun code envoyé à ce numéro');
    }
    
    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(formattedPhone);
      throw new BadRequestException('Code expiré');
    }
    
    if (code !== stored.code) {
      throw new BadRequestException('Code incorrect');
    }
    
    // Effacer après vérification
    this.otpStore.delete(formattedPhone);
    return true;
  }

  async resendOtp(phone: string): Promise<{ message: string }> {
    return this.sendOtp(phone);
  }
}