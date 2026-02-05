import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class WhatsappConnectGuard extends AuthGuard('facebook') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    return {
      state: Buffer.from(JSON.stringify({ workspaceId, token, isWhatsapp: true })).toString('base64'), 
      scope: ['email', 'public_profile', 'whatsapp_business_management', 'whatsapp_business_messaging'],
    };
  }
}