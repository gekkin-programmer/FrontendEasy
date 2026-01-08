import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: Number(config.get('SMTP_PORT')),
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  async sendOtp(email: string, otp: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 480px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .brand { color: #3C48F6; font-size: 24px; font-weight: 800; text-decoration: none; letter-spacing: -1px; }
          .card { background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #eaeaea; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
          .title { margin-top: 0; font-size: 22px; font-weight: 700; color: #111; text-align: center; }
          .text { color: #555; text-align: center; margin-bottom: 30px; }
          .code-box { background: #f4f6f8; border-radius: 8px; padding: 16px; text-align: center; margin: 30px 0; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #3C48F6; border: 1px dashed #cfd7e6; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="brand">EasyPost</span>
          </div>
          
          <div class="card">
            <h2 class="title">Verify your email</h2>
            <p class="text">
              Thanks for starting your journey with EasyPost. Enter the following verification code to continue:
            </p>
            
            <div class="code-box">${otp}</div>
            
            <p class="text" style="font-size: 14px; margin-bottom: 0;">
              This code expires in <strong>10 minutes</strong>.
            </p>
          </div>
          
          <div class="footer">
            <p>If you didn't request this code, you can safely ignore this email.</p>
            <p>© ${new Date().getFullYear()} EasyPost Inc. Douala, Cameroon 🇨🇲</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(email, 'Your Verification Code', html);
  }

  async sendInvite(email: string, workspaceName: string, inviteToken: string, isNewUser: boolean) {
    const link = `${this.config.get('FRONTEND_URL')}/join?token=${inviteToken}`;
    await this.sendMail(email, 'Invitation', `<p>Join ${workspaceName}: <a href="${link}">Click here</a></p>`);
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM'),
        to,
        subject,
        html,
      });
      this.logger.log(` Email sent to ${to} via SMTP2GO`);
    } catch (e) {
      this.logger.error('SMTP Error', e);
    }
  }
}