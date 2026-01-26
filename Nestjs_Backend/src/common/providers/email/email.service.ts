import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: Number(this.config.get('SMTP_PORT')) || 587,
      secure: false, 
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  // ➤ 1. SEND OTP
  async sendOtp(email: string, otp: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM') || '"EasyPost" <noreply@easypost.cm>',
        to: email,
        subject: '🔐 Your Verification Code',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Verify your email</h2>
            <p>Use this code to complete your signup:</p>
            <h1 style="color: #3C48F6; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <div class="code-box" style="display:none;">${otp}</div> <!-- Hidden div for fallback regex -->
            <p>Expires in 10 minutes.</p>
          </div>
        `,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Email Failed:', error);
      console.log(`🚨 [EMERGENCY LOG] OTP for ${email}: ${otp}`); 
      return false; 
    }
  }

  // ➤ 2. SEND TOKEN EXPIRY ALERT 
  async sendTokenExpiryAlert(to: string, userName: string, platform: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM') || '"EasyPost" <noreply@easypost.cm>',
        to: to,
        subject: `Action Required: Reconnect your ${platform} account`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #d93025;">Action Required</h2>
            <p>Hello ${userName},</p>
            <p>Your connection to <strong>${platform}</strong> has expired.</p>
            <p>Please reconnect your account in EasyPost to continue scheduling.</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send expiry alert to ${to}`, error);
      return false;
    }
  }

  // ➤ 3. SEND INVITE 
  async sendInvite(email: string, workspaceName: string, inviteToken: string, isNewUser: boolean) {
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3001';
    const actionPath = isNewUser ? '/register' : '/dashboard';
    const link = `${frontendUrl}${actionPath}?token=${inviteToken}&email=${email}`;

    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
        to: email,
        subject: `Invitation to ${workspaceName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #304AEB;">Invitation</h2>
            <p>You have been invited to join <strong>${workspaceName}</strong> on EasyPost.</p>
            <a href="${link}" style="background-color: #304AEB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
              Accept Invitation
            </a>
          </div>
        `,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send invite to ${email}`, error);
      return false;
    }
  }
}