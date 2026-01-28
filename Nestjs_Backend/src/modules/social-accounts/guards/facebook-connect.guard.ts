import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookConnectGuard extends AuthGuard('facebook') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    console.log("🔹 Guard: Setting State", { workspaceId, hasToken: !!token }); // Debug log

    return {
      // Pass metadata safely through OAuth flow
      state: JSON.stringify({ workspaceId, token }),
      scope: [
        'email', 
        'public_profile', 
        'pages_show_list', 
        'pages_read_engagement', 
        'pages_manage_posts',
        'instagram_basic', 
        'instagram_content_publish'
      ],
    };
  }
}