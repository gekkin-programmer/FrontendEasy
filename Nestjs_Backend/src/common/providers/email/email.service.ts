import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiKey: string;
  private senderEmail: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get('BREVO_API_KEY') || ''; 
    this.senderEmail = this.config.get('SMTP_FROM') || 'nkouambrayan@gmail.com'; 
    
    if (!this.apiKey) {
      this.logger.warn("⚠️ BREVO_API_KEY is missing. Emails will fail.");
    }
  }

  // ➤ SEND OTP (With Your Premium Template)
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
          .brand { color: #304AEB; font-size: 24px; font-weight: 800; text-decoration: none; letter-spacing: -1px; }
          .card { background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #eaeaea; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
          .title { margin-top: 0; font-size: 22px; font-weight: 700; color: #111; text-align: center; }
          .text { color: #555; text-align: center; margin-bottom: 30px; }
          .code-box { background: #f4f6f8; border-radius: 8px; padding: 16px; text-align: center; margin: 30px 0; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #304AEB; border: 1px dashed #cfd7e6; }
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

    await this.send(email, 'Your Verification Code', html);
  }

  // ➤ SEND INVITE
  async sendInvite(email: string, workspaceName: string, inviteToken: string, isNewUser: boolean) {
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3001';
    const actionPath = isNewUser ? '/register' : '/dashboard';
    const link = `${frontendUrl}${actionPath}?token=${inviteToken}&email=${email}`;
    
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #304AEB;">Invitation</h2>
        <p>You have been invited to join <strong>${workspaceName}</strong> on EasyPost.</p>
        <a href="${link}" style="background-color: #304AEB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          Accept Invitation
        </a>
      </div>
    `;
    await this.send(email, `Invitation to ${workspaceName}`, html);
  }

  // --- BREVO HTTP API CALL (Bypasses SMTP Ports) ---
  private async send(to: string, subject: string, htmlContent: string) {
    if (!this.apiKey) {
      this.logger.warn(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      // Clean sender email format: "EasyPost <email>" -> { name: "EasyPost", email: "email" }
      const senderMatch = this.senderEmail.match(/(.*)<(.+)>/);
      const senderName = senderMatch ? senderMatch[1].trim() : "EasyPost";
      const senderAddr = senderMatch ? senderMatch[2].trim() : this.senderEmail;

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey, // 👈 Using API Key header
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: senderAddr, name: senderName },
          to: [{ email: to }],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
      }

      this.logger.log(`📧 Email sent successfully to ${to} via Brevo API`);
    } catch (e) {
      this.logger.error('Email Delivery Failed', e);
      // In Production, throwing error here ensures the user knows the email failed
      throw new Error("Failed to send email. Please try again.");
    }
  }
}