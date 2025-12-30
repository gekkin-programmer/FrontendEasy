import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TermiiSmsOptions, TermiiSmsResponse } from '../interfaces/auth.interface';

@Injectable()
export class TermiiSmsService {
  private readonly logger = new Logger(TermiiSmsService.name);
  private readonly apiKey: string;
  private readonly senderId: string;
  private readonly apiUrl = 'https://api.ng.termii.com/api'; // Africa endpoint

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TERMII_API_KEY') || '';
    this.senderId = this.configService.get<string>('TERMII_SENDER_ID', 'TCHOKOS');
    
    if (!this.apiKey) {
      this.logger.warn('TERMII_API_KEY non configuré. Mode développement activé.');
    }
  }

  /**
   * Format phone number for Termii
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let formatted = phone.replace(/\D/g, '');
    
    // If starts with 237, keep it
    if (formatted.startsWith('237')) {
      return formatted;
    }
    
    // If starts with 0, replace with 237
    if (formatted.startsWith('0')) {
      return '237' + formatted.substring(1);
    }
    
    // If starts with +, remove it
    if (phone.startsWith('+')) {
      return formatted;
    }
    
    // Default: assume it's a Cameroon number starting with 6
    if (formatted.length === 9 && formatted.startsWith('6')) {
      return '237' + formatted;
    }
    
    return formatted;
  }

  /**
   * Detect phone operator in Cameroon
   */
  detectOperator(phone: string): 'MTN' | 'ORANGE' | 'NEXTTEL' | 'UNKNOWN' {
    const formatted = this.formatPhoneNumber(phone);
    const prefix = formatted.substring(3, 6); // Get first 3 digits after 237
    
    const mtnPrefixes = ['655', '656', '657', '658', '659', '680', '681', '682'];
    const orangePrefixes = ['690', '691', '692', '693', '694', '695', '696', '697'];
    const nexttelPrefixes = ['660', '661', '662', '663', '664'];
    
    if (mtnPrefixes.includes(prefix)) return 'MTN';
    if (orangePrefixes.includes(prefix)) return 'ORANGE';
    if (nexttelPrefixes.includes(prefix)) return 'NEXTTEL';
    
    return 'UNKNOWN';
  }

  /**
   * Send SMS via Termii API
   */
  async sendSms(to: string, message: string): Promise<boolean> {
    const formattedTo = this.formatPhoneNumber(to);
    const operator = this.detectOperator(to);
    
    this.logger.debug(`Envoi SMS à ${formattedTo} (${operator})`);

    // Development mode - log to console
    if (this.configService.get('NODE_ENV') !== 'production' || !this.apiKey) {
      this.logger.log(`[DEV SMS] À: ${to} | Message: ${message}`);
      this.logger.log(`[DEV SMS] Numéro formaté: ${formattedTo} | Opérateur: ${operator}`);
      return true;
    }

    try {
      const options: TermiiSmsOptions = {
        to: formattedTo,
        from: this.senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: this.apiKey,
      };

      const response = await axios.post<TermiiSmsResponse>(
        `${this.apiUrl}/sms/send`,
        options,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      this.logger.log(`SMS envoyé à ${to}: ${response.data.message_id}`);
      this.logger.debug(`Balance Termii: ${response.data.balance}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Erreur Termii pour ${to}:`, error.response?.data || error.message);
      
      // Fallback: log to console in production if Termii fails
      this.logger.warn(`Fallback SMS pour ${to}: ${message}`);
      
      return false;
    }
  }

  /**
   * Send OTP via Termii (specialized method for authentication)
   */
  async sendOtp(to: string, otp: string): Promise<boolean> {
    const message = `Votre code de vérification Tchokos est: ${otp}. Valide 10 minutes.`;
    return this.sendSms(to, message);
  }

  /**
   * Send OTP via Termii Verify API (more reliable for OTP)
   */
  async sendOtpViaVerifyApi(to: string, otp: string): Promise<boolean> {
    const formattedTo = this.formatPhoneNumber(to);
    
    // Development mode
    if (this.configService.get('NODE_ENV') !== 'production' || !this.apiKey) {
      this.logger.log(`[DEV OTP] À: ${to} | OTP: ${otp}`);
      return true;
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/sms/otp/send`,
        {
          api_key: this.apiKey,
          message_type: 'NUMERIC',
          to: formattedTo,
          from: this.senderId,
          channel: 'generic',
          pin_attempts: 3,
          pin_time_to_live: 10, // minutes
          pin_length: 6,
          pin_placeholder: `< ${otp} >`,
          message_text: `Votre code de vérification Tchokos est < ${otp} >. Il expire dans 10 minutes.`,
          pin_type: 'NUMERIC',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`OTP envoyé via Termii Verify: ${response.data.pinId}`);
      return true;
    } catch (error) {
      this.logger.error('Erreur Termii Verify:', error.response?.data || error.message);
      
      // Fallback to regular SMS
      return this.sendOtp(to, otp);
    }
  }

  /**
   * Verify OTP via Termii API
   */
  async verifyOtp(pinId: string, otp: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/sms/otp/verify`,
        {
          api_key: this.apiKey,
          pin_id: pinId,
          pin: otp,
        }
      );

      return response.data.verified === true;
    } catch (error) {
      this.logger.error('Erreur vérification OTP Termii:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Get Termii account balance
   */
  async getBalance(): Promise<number> {
    if (!this.apiKey) return 0;

    try {
      const response = await axios.get(
        `${this.apiUrl}/get-balance`,
        {
          params: {
            api_key: this.apiKey,
          },
        }
      );

      return response.data.balance || 0;
    } catch (error) {
      this.logger.error('Erreur récupération balance Termii:', error.message);
      return 0;
    }
  }
}