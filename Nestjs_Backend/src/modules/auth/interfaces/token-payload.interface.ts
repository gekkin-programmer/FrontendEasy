export interface TokenPayload {
  sub: string;
  email: string;
  accountType: string;
  workspaceId?: string;
}