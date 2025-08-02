export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
  device_info?: any;
}

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  permissions: string[];
  avatar?: string;
  last_login?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: AuthUser;
    active_season?: any;
  };
  message: string;
  timestamp: string;
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