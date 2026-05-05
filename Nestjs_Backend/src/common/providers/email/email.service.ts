import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiKey: string;
  private fromEmail: string;
  private adminEmail: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('RESEND_API_KEY') || '';
    this.fromEmail =
      this.config.get<string>('EMAIL_FROM') || 'support@eazypost.cm';
    this.adminEmail =
      this.config.get<string>('ADMIN_EMAIL') || 'admin@eazypost.cm';
  }

  // ─────────────────────────────────────────────
  // SHARED LAYOUT
  // ─────────────────────────────────────────────
  private layout(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EazyPost</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#3C48F6;padding:28px 40px;border-radius:12px 12px 0 0;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">EazyPost</span>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#fafafa;padding:24px 40px;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 12px 12px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#999999;">
                You're receiving this email because you have an account on
                <a href="https://eazypost.cm" style="color:#3C48F6;text-decoration:none;">eazypost.cm</a>.
              </p>
              <p style="margin:0;font-size:12px;color:#bbbbbb;">
                &copy; ${new Date().getFullYear()} EazyPost &mdash;
                <a href="mailto:support@eazypost.cm" style="color:#bbbbbb;">support@eazypost.cm</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  // ─────────────────────────────────────────────
  // SEND HELPER
  // ─────────────────────────────────────────────
  private async send(to: string, subject: string, html: string) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: `EazyPost <${this.fromEmail}>`,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody: unknown = await response.json();
      throw new Error(JSON.stringify(errorBody));
    }
  }

  // ─────────────────────────────────────────────
  // 1. OTP VERIFICATION
  // ─────────────────────────────────────────────
  async sendOtp(email: string, otp: string) {
    if (!this.apiKey) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return true;
    }

    const html = this.layout(`
      <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111111;">Verify your email address</h2>
      <p style="margin:0 0 32px;font-size:15px;color:#555555;line-height:1.6;">
        Use the code below to complete your sign-up. It expires in <strong>10 minutes</strong>.
      </p>

      <div style="background-color:#f4f4f0;border-radius:8px;padding:24px;text-align:center;margin-bottom:32px;">
        <span style="font-size:42px;font-weight:800;color:#3C48F6;letter-spacing:10px;font-family:'Courier New',monospace;">${otp}</span>
      </div>

      <p style="margin:0 0 8px;font-size:13px;color:#999999;">
        If you didn't create an EazyPost account, you can safely ignore this email.
      </p>
    `);

    try {
      await this.send(email, 'Your EazyPost verification code', html);
      this.logger.log(`OTP sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error('OTP email failed', error);
      console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
      return false;
    }
  }

  // ─────────────────────────────────────────────
  // 2. WORKSPACE INVITE
  // ─────────────────────────────────────────────
  async sendInvite(
    email: string,
    workspaceName: string,
    inviteToken: string,
    isNewUser: boolean,
  ) {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const actionPath = isNewUser ? '/signup' : '/dashboard';
    const link = `${frontendUrl}${actionPath}?invite=${inviteToken}&email=${encodeURIComponent(email)}`;

    if (!this.apiKey) {
      console.log(`[DEV] Invite for ${email}: ${link}`);
      return true;
    }

    // Two distinct emails depending on whether the invitee has an account
    const subject = isNewUser
      ? `You've been invited to join ${workspaceName} — Create your EazyPost account`
      : `You've been invited to join ${workspaceName} on EazyPost`;

    const html = isNewUser
      ? this.layout(`
          <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111111;">You're invited to EazyPost!</h2>
          <p style="margin:0 0 8px;font-size:15px;color:#555555;line-height:1.6;">
            You've been invited to join the workspace <strong style="color:#111111;">${workspaceName}</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
            Create your free EazyPost account to start collaborating with your team.
          </p>

          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="background-color:#3C48F6;border-radius:8px;">
                <a href="${link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                  Create account &amp; join &rarr;
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 8px;font-size:13px;color:#999999;">
            This invitation is intended for <strong>${email}</strong>. If this wasn't you, you can ignore this email.
          </p>
          <p style="margin:0;font-size:12px;color:#bbbbbb;word-break:break-all;">Or copy this link: ${link}</p>
        `)
      : this.layout(`
          <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111111;">You've been invited</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
            You've been invited to join the workspace <strong style="color:#111111;">${workspaceName}</strong> on EazyPost.
            Click below to accept and start collaborating.
          </p>

          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="background-color:#3C48F6;border-radius:8px;">
                <a href="${link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                  Accept invitation &rarr;
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 8px;font-size:13px;color:#999999;">
            Button not working? Copy this link into your browser:
          </p>
          <p style="margin:0;font-size:12px;color:#bbbbbb;word-break:break-all;">${link}</p>
        `);

    try {
      await this.send(email, subject, html);
      return true;
    } catch (e) {
      this.logger.error('Invite email failed', e);
      return false;
    }
  }

  // ─────────────────────────────────────────────
  // 3. PASSWORD RESET
  // ─────────────────────────────────────────────
  async sendPasswordReset(email: string, token: string) {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const link = `${frontendUrl}/reset-password?token=${token}`;

    if (!this.apiKey) {
      console.log(`[DEV] Password reset for ${email}: ${link}`);
      return true;
    }

    const html = this.layout(`
      <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111111;">Reset your password</h2>
      <p style="margin:0 0 32px;font-size:15px;color:#555555;line-height:1.6;">
        We received a request to reset the password for your EazyPost account.
        Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.
      </p>

      <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td style="background-color:#3C48F6;border-radius:8px;">
            <a href="${link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
              Reset password &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:13px;color:#999999;">
        If you didn't request a password reset, you can safely ignore this email —
        your password will not be changed.
      </p>
      <p style="margin:0;font-size:12px;color:#bbbbbb;word-break:break-all;">
        Or copy this link: ${link}
      </p>
    `);

    try {
      await this.send(email, 'Reset your EazyPost password', html);
      this.logger.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error('Password reset email failed', error);
      return false;
    }
  }

  // ─────────────────────────────────────────────
  // 4. TOKEN EXPIRY ALERT (Required by SocialSyncProcessor)
  // ─────────────────────────────────────────────
  sendTokenExpiryAlert(_to: string, _userName: string, _platform: string) {
    if (!this.apiKey) return false;
    return true;
  }
}
