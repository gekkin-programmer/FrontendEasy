export interface UserPayload {
  sub: string;
  email?: string;
  phone?: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  tokens: TokenResponse;
}

export interface GoogleUserData {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  googleId: string;
  accessToken: string;
}

export interface PhoneVerificationData {
  phone: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}

export interface TermiiSmsResponse {
  message_id: string;
  message: string;
  balance: number;
  user: string;
}

export interface TermiiSmsOptions {
  to: string;
  from: string;
  sms: string;
  type: string;
  channel: string;
  api_key: string;
}

export interface CameroonPhoneInfo {
  formatted: string;
  operator: 'MTN' | 'ORANGE' | 'NEXTTEL' | 'UNKNOWN';
  isValid: boolean;
}