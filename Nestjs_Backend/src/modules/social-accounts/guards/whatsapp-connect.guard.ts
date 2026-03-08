import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class WhatsappConnectGuard extends AuthGuard('facebook') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    if (req.session && workspaceId && token) {
      req.session.oauthMetadata = {
        workspaceId,
        token,
        isWhatsapp: true,
      };
      console.log('🔹 WhatsApp Guard: Metadata saved to session');
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    return {
      scope: [
        'email',
        'public_profile',
        'whatsapp_business_management',
        'whatsapp_business_messaging',
      ],
    };
  }
}
