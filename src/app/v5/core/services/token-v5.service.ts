import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TokenData {
  access_token: string;
  token_type: string;
  expires_at?: string; // ✅ Hacerlo opcional para evitar errores
}

export interface UserContext {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  permissions: string[];
  avatar_url?: string;
  last_login_at?: string;
}

export interface SchoolContext {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  timezone?: string;
  currency?: string;
}

export interface SeasonContext {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_current?: boolean;
}

export interface LoginResponse {
  access_token?: string;
  token?: string;
  token_type?: string;
  expires_at?: string;
  user?: UserContext;
  school?: SchoolContext;
  schools?: SchoolContext[];
  season?: SeasonContext;
  success?: boolean;
  message?: string;
  timestamp?: string;
  data?: {
    user?: UserContext;
    school?: SchoolContext;
    schools?: SchoolContext[];
    season?: SeasonContext;
    token?: string;
    access_token?: string;
    expires_at?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TokenV5Service {
  private readonly TOKEN_KEY = 'boukii_v5_token';
  private readonly USER_KEY = 'boukii_v5_user';
  private readonly SCHOOL_KEY = 'boukii_v5_school';
  private readonly SEASON_KEY = 'boukii_v5_season';
  private readonly TEMP_TOKEN_KEY = 'boukii_v5_temp_token';

  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<UserContext | null>(null);
  private schoolSubject = new BehaviorSubject<SchoolContext | null>(null);
  private seasonSubject = new BehaviorSubject<SeasonContext | null>(null);

  // Observables públicos
  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();
  public school$ = this.schoolSubject.asObservable();
  public season$ = this.seasonSubject.asObservable();

  constructor() {
    // Inicializar subjects con datos almacenados de forma segura
    try {
      this.tokenSubject.next(this.getStoredToken());
      this.userSubject.next(this.getStoredUser());
      this.schoolSubject.next(this.getStoredSchool());
      this.seasonSubject.next(this.getStoredSeason());
    } catch (error) {
      console.warn('⚠️ Error loading stored data on service initialization:', error);
      // Los subjects ya están inicializados con null, así que es seguro continuar
    }
  }

  /**
   * Guardar datos completos del login
   */
  saveLoginData(loginResponse: LoginResponse): void {
    try {
      console.log('🔍 DEBUG: TokenV5Service.saveLoginData called with:', typeof loginResponse);
      console.log('🔍 DEBUG: Using FIXED version 3.0 - with optional chaining');
      
      // Validar que loginResponse no es null/undefined
      if (!loginResponse) {
        console.error('❌ loginResponse is null or undefined');
        throw new Error('No login response provided');
      }
      
      console.log('🔍 DEBUG: Raw login response received:', JSON.stringify(loginResponse, null, 2));
      
      // Extraer datos - pueden estar en 'data' o directamente en la respuesta
      const user = loginResponse?.data?.user || loginResponse?.user;
      // ✅ CORREGIR: Backend envía 'schools' (plural), tomar el primero
      const school = loginResponse?.data?.school || loginResponse?.school || 
                    (loginResponse?.data?.schools && loginResponse.data.schools[0]) || 
                    (loginResponse?.schools && loginResponse.schools[0]);
      const season = loginResponse?.data?.season || loginResponse?.season;
      const token = loginResponse?.data?.token || loginResponse?.token || loginResponse?.access_token;
      const expiresAt = loginResponse?.data?.expires_at || loginResponse?.expires_at;

      console.log('🔍 DEBUG: Extracted data:', {
        user: user,
        school: school,
        season: season,
        token: token ? 'TOKEN_EXISTS' : 'NO_TOKEN',
        expiresAt: expiresAt
      });

      if (!user || !school || !season || !token) {
        console.error('❌ Missing required login data:', {
          hasUser: !!user,
          hasSchool: !!school,
          hasSeason: !!season,
          hasToken: !!token,
          rawResponse: loginResponse
        });
        throw new Error('Incomplete login data received from server');
      }

      console.log('🔍 DEBUG: About to save token data...');
      
      // Guardar token
      const tokenData: TokenData = {
        access_token: token,
        token_type: 'Bearer',
        expires_at: expiresAt || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // ✅ Default 8 hours
      };
      console.log('🔍 DEBUG: Token data created:', tokenData);
      
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
      console.log('🔍 DEBUG: Token saved to localStorage');

      // Guardar contextos
      console.log('🔍 DEBUG: Saving user to localStorage...');
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      console.log('🔍 DEBUG: Saving school to localStorage...');
      localStorage.setItem(this.SCHOOL_KEY, JSON.stringify(school));
      console.log('🔍 DEBUG: Saving season to localStorage...');
      localStorage.setItem(this.SEASON_KEY, JSON.stringify(season));
      console.log('🔍 DEBUG: All context data saved to localStorage');

      // Emitir nuevos valores
      console.log('🔍 DEBUG: Emitting token...');
      this.tokenSubject.next(token);
      console.log('🔍 DEBUG: Emitting user...');
      this.userSubject.next(user);
      console.log('🔍 DEBUG: Emitting school...');
      this.schoolSubject.next(school);
      console.log('🔍 DEBUG: Emitting season...');
      this.seasonSubject.next(season);
      console.log('🔍 DEBUG: All subjects updated');

      console.log('✅ Login data saved successfully', {
        user: user?.email || 'NO_EMAIL',
        school: school?.name || 'NO_SCHOOL_NAME',
        season: season?.name || 'NO_SEASON_NAME'
      });
    } catch (error) {
      console.error('❌ Error saving login data:', error);
      throw new Error('Failed to save login data');
    }
  }

  /**
   * Guardar datos parciales del login inicial (sin temporada)
   */
  savePartialLoginData(partialData: any): void {
    try {
      console.log('🔍 DEBUG: Raw partial login data received:', JSON.stringify(partialData, null, 2));
      
      // Validar que tenemos los datos mínimos necesarios
      if (!partialData || !partialData.access_token || !partialData.user) {
        console.error('❌ Missing required partial login data:', {
          hasAccessToken: !!partialData?.access_token,
          hasUser: !!partialData?.user,
          rawData: partialData
        });
        throw new Error('Incomplete partial login data received from server');
      }

      // Guardar token
      const tokenData: TokenData = {
        access_token: partialData.access_token,
        token_type: partialData.token_type || 'Bearer',
        expires_at: partialData.expires_at || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      };
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
      console.log('🔍 DEBUG: Partial token saved to localStorage');

      // Guardar contextos (usuario y escuela, temporada es null)
      localStorage.setItem(this.USER_KEY, JSON.stringify(partialData.user));
      if (partialData.school) {
        localStorage.setItem(this.SCHOOL_KEY, JSON.stringify(partialData.school));
      }
      localStorage.removeItem(this.SEASON_KEY); // Limpiar temporada anterior
      console.log('🔍 DEBUG: Partial context data saved to localStorage');

      // Emitir nuevos valores
      this.tokenSubject.next(partialData.access_token);
      this.userSubject.next(partialData.user);
      this.schoolSubject.next(partialData.school || null);
      this.seasonSubject.next(null); // Sin temporada hasta la selección
      console.log('🔍 DEBUG: Partial subjects updated');

      console.log('✅ Partial login data saved successfully', {
        user: partialData.user?.email || 'NO_EMAIL',
        school: partialData.school?.name || 'NO_SCHOOL_NAME',
        requiresSeasonSelection: partialData.requires_season_selection
      });
    } catch (error) {
      console.error('❌ Error saving partial login data:', error);
      throw new Error('Failed to save partial login data');
    }
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    const token = this.tokenSubject.value;
    console.log('🔍 TokenV5Service.getToken():', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 15) + '...' || 'N/A',
      subjectValue: !!this.tokenSubject.value
    });
    return token;
  }

  /**
   * Obtener token formateado para headers HTTP
   */
  getAuthorizationHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Verificar si hay un token válido
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('❌ TokenV5Service.hasValidToken(): No token found');
      return false;
    }

    const isExpired = this.isTokenExpired();
    const isValid = !isExpired;
    
    console.log('🔍 TokenV5Service.hasValidToken():', {
      hasToken: !!token,
      isExpired,
      isValid,
      tokenLength: token.length
    });
    
    return isValid;
  }

  /**
   * Verificar si el token ha expirado
   */
  isTokenExpired(): boolean {
    try {
      const tokenData = this.getStoredTokenData();
      if (!tokenData?.expires_at) return true;

      const expirationDate = new Date(tokenData.expires_at);
      const now = new Date();

      // Considerar expirado si faltan menos de 5 minutos
      const bufferTime = 5 * 60 * 1000; // 5 minutos en ms
      return (expirationDate.getTime() - now.getTime()) < bufferTime;
    } catch {
      return true;
    }
  }

  /**
   * Obtener datos del usuario actual
   */
  getCurrentUser(): UserContext | null {
    return this.userSubject.value;
  }

  /**
   * Obtener datos de la escuela actual
   */
  getCurrentSchool(): SchoolContext | null {
    return this.schoolSubject.value;
  }

  /**
   * Obtener datos de la temporada actual
   */
  getCurrentSeason(): SeasonContext | null {
    return this.seasonSubject.value;
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) ?? false;
  }

  /**
   * Verificar si el usuario tiene uno de varios permisos
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Verificar si el usuario tiene uno de varios roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Guardar token temporal para selección de escuela
   */
  setTempToken(tempToken: string): void {
    try {
      localStorage.setItem(this.TEMP_TOKEN_KEY, tempToken);
      console.log('✅ Temporary token saved');
    } catch (error) {
      console.error('❌ Error saving temporary token:', error);
    }
  }

  /**
   * Obtener token temporal
   */
  getTempToken(): string | null {
    try {
      return localStorage.getItem(this.TEMP_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Limpiar token temporal
   */
  clearTempToken(): void {
    try {
      localStorage.removeItem(this.TEMP_TOKEN_KEY);
      console.log('✅ Temporary token cleared');
    } catch (error) {
      console.error('❌ Error clearing temporary token:', error);
    }
  }

  /**
   * Verificar si hay un token temporal válido
   */
  hasTempToken(): boolean {
    return !!this.getTempToken();
  }

  /**
   * Obtener el token actual (normal o temporal)
   */
  getCurrentToken(): string | null {
    // Primero intentar el token normal, luego el temporal
    return this.getToken() || this.getTempToken();
  }

  /**
   * Limpiar todos los datos almacenados
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.SCHOOL_KEY);
      localStorage.removeItem(this.SEASON_KEY);
      localStorage.removeItem(this.TEMP_TOKEN_KEY);

      this.tokenSubject.next(null);
      this.userSubject.next(null);
      this.schoolSubject.next(null);
      this.seasonSubject.next(null);

      console.log('✅ All authentication data cleared');
    } catch (error) {
      console.error('❌ Error clearing authentication data:', error);
    }
  }

  /**
   * Actualizar datos del usuario (para cuando se actualizan desde el backend)
   */
  updateUserData(user: UserContext): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  /**
   * Cambiar contexto de temporada (sin relogin)
   */
  updateSeasonContext(season: SeasonContext): void {
    localStorage.setItem(this.SEASON_KEY, JSON.stringify(season));
    this.seasonSubject.next(season);
  }

  /**
   * Obtener información de expiración del token
   */
  getTokenExpirationInfo(): { expires_at: Date; minutes_remaining: number } | null {
    try {
      const tokenData = this.getStoredTokenData();
      if (!tokenData?.expires_at) return null;

      const expirationDate = new Date(tokenData.expires_at);
      const now = new Date();
      const minutesRemaining = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60));

      return {
        expires_at: expirationDate,
        minutes_remaining: Math.max(0, minutesRemaining)
      };
    } catch {
      return null;
    }
  }

  // Métodos privados para obtener datos del localStorage

  private getStoredToken(): string | null {
    try {
      const tokenData = this.getStoredTokenData();
      return tokenData?.access_token || null;
    } catch {
      return null;
    }
  }

  private getStoredTokenData(): TokenData | null {
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getStoredUser(): UserContext | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getStoredSchool(): SchoolContext | null {
    try {
      const stored = localStorage.getItem(this.SCHOOL_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getStoredSeason(): SeasonContext | null {
    try {
      const stored = localStorage.getItem(this.SEASON_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
