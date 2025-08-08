export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
  device_info?: any;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface SchoolContext {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export interface Season {
  id: number;
  name: string;
  year: number;
  is_current: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: AuthUser;
    school: SchoolContext;
    season: Season;
    token: string;
    expires_at?: string;
    context?: any;
  };
  message: string;
  timestamp: string;
  // Para compatibilidad con respuestas donde faltan campos
  user?: AuthUser;
  school?: SchoolContext;
  season?: Season;
  token?: string;
  access_token?: string; // Fallback
  expires_at?: string;
  available_seasons?: any[];
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface SessionInfo {
  token: string;
  user: AuthUser;
  expiresAt: string;
  lastActivity: string;
}