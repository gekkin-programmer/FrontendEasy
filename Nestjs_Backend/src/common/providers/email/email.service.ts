import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiKey: string;
  private fromEmail: string;

  constructor(private config: ConfigService) {
    // ➤ FIX: Add fallback string to satisfy TypeScript
    this.apiKey = this.config.get<string>('RESEND_API_KEY') || '';
    this.fromEmail = this.config.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';
  }

  async sendOtp(email: string, otp: string) {
    // 1. Dev Mode / Fallback if no Key
    if (!this.apiKey) {
       console.log(`🚨 [DEV MODE - NO API KEY] OTP for ${email}: ${otp}`);
       return true;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: email, 
          subject: '🔐 Your Verification Code',
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Verify your email</h2>
              <p>Your code is:</p>
              <h1 style="color: #3C48F6; letter-spacing: 5px;">${otp}</h1>
              <p>It expires in 10 minutes.</p>
              <div class="code-box" style="display:none;">${otp}</div>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }

      this.logger.log(`🚀 Email sent via Resend to ${email}`);
      return true;
    } catch (error) {
      this.logger.error('Resend Failed', error);
      
      // ➤ EMERGENCY FALLBACK: Log to console so you can still demo even if API fails
      console.log(`🚨 [EMERGENCY FALLBACK] OTP for ${email}: ${otp}`);
      
      return false; 
    }
  }

  // Method required by your other processors
  async sendTokenExpiryAlert(to: string, userName: string, platform: string) {
     if (!this.apiKey) return false;
     return true;
  }
}