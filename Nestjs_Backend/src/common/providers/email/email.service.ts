import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async sendInvite(email: string, workspaceName: string, inviteToken: string, isNewUser: boolean) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    
    // Logic: If new user -> Go to Register page. If existing -> Go to Dashboard join page.
    const actionPath = isNewUser ? '/register' : '/dashboard/join';
    const link = `${frontendUrl}${actionPath}?token=${inviteToken}&email=${email}`;

    const subject = isNewUser 
      ? `You've been invited to join ${workspaceName} on EasyPost`
      : `Invitation to collaborate on ${workspaceName}`;

    try {
      await this.resend.emails.send({
        from: 'EasyPost <onboarding@resend.dev>', //  prod, domain e.g. team@easypost.cm
        to: email,
        subject: subject,
        html: `
          <h2>Hello! Welcome to EasyPost</h2>
          <p>You have been invited to the workspace <strong>${workspaceName}</strong>.</p>
          <p>${isNewUser ? 'Create an account to accept.' : 'Click below to accept.'}</p>
          <a href="${link}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">
            Accept Invitation
          </a>
        `,
      });
      this.logger.log(` Invite sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send email via Resend', error);
    }
  }
}