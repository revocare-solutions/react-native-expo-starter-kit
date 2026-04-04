export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  attributes?: Record<string, string>;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
