export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenExpiresAt?: number;
}

export type ProfileResponse = {
  fullName: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
};
