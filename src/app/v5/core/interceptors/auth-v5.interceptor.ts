import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenV5Service, SchoolContext, SeasonContext } from '../services/token-v5.service';
import { AuthV5Service } from '../services/auth-v5.service';

@Injectable()
export class AuthV5Interceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenService: TokenV5Service,
    private authService: AuthV5Service,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Agregar headers necesarios
    const modifiedRequest = this.addRequiredHeaders(request);
    
    return next.handle(modifiedRequest).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          return this.handleHttpError(modifiedRequest, next, error);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Agregar headers requeridos a las requests
   */
  private addRequiredHeaders(request: HttpRequest<unknown>): HttpRequest<unknown> {
    let headers = request.headers;
    
    console.log('🔍 AuthV5Interceptor processing request:', request.url);

    // Solo procesar requests a nuestra API
    if (!this.shouldProcessRequest(request)) {
      console.log('⏭️ Skipping request (not API V5):', request.url);
      return request;
    }
    
    console.log('✅ Processing API V5 request:', request.url);

    // 1. Agregar token de autorización (normal o temporal)
    const token = this.tokenService.getCurrentToken(); // Usa getToken() o getTempToken()
    if (token && !this.shouldSkipToken(request)) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('🔐 AuthV5Interceptor: Added Authorization header to:', request.url);
      console.log('🔍 Token details:', {
        tokenLength: token.length,
        tokenStart: token.substring(0, 10) + '...',
        isNormalToken: !!this.tokenService.getToken(),
        isTempToken: !!this.tokenService.getTempToken()
      });
    } else if (!token) {
      console.warn('⚠️ AuthV5Interceptor: No token available for:', request.url);
    }

    // 2. Agregar contexto de escuela
    const school = this.tokenService.getCurrentSchool();
    if (school) {
      headers = headers.set('X-School-ID', school.id.toString());
      console.log('🏫 AuthV5Interceptor: Added X-School-ID header:', school.id, 'for school:', school.name, 'on URL:', request.url);
    } else {
      console.warn('⚠️ AuthV5Interceptor: No school context available for:', request.url);
    }

    // 3. Agregar contexto de temporada  
    const season = this.tokenService.getCurrentSeason();
    if (season) {
      headers = headers.set('X-Season-ID', season.id.toString());
      console.log('🏷️ AuthV5Interceptor: Added X-Season-ID header:', season.id, 'for season:', season.name);
    } else {
      console.warn('⚠️ AuthV5Interceptor: No season context available for:', request.url);
    }

    // 4. Agregar headers informativos
    headers = headers.set('X-Client-Version', 'boukii-admin-v5.0');
    headers = headers.set('X-Client-Type', 'angular-admin');

    // 5. Asegurar Content-Type para requests con body
    if (this.hasRequestBody(request) && !headers.has('Content-Type')) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return request.clone({ headers });
  }

  /**
   * Verificar si debe procesar esta request
   */
  private shouldProcessRequest(request: HttpRequest<unknown>): boolean {
    const url = request.url.toLowerCase();
    
    // Procesar solo requests a nuestra API de Boukii
    const shouldProcess = (
      url.includes('/api/v5/') || 
      url.includes('api-boukii.test') || 
      url.includes('api.boukii') ||
      url.includes('127.0.0.1') && url.includes('/api/')
    );
    
    console.log(`🔍 Should process request ${request.url}:`, shouldProcess);
    return shouldProcess;
  }

  /**
   * Verificar si se debe omitir el token para esta request
   */
  private shouldSkipToken(request: HttpRequest<unknown>): boolean {
    const skipTokenUrls = [
      '/auth/login',
      '/auth/register', 
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/check-user',  // Nuevo endpoint que no requiere token
      '/public/'
    ];

    const url = request.url.toLowerCase();
    
    // Para evitar falsos positivos, usar una lógica más específica
    const shouldSkip = skipTokenUrls.some(skipUrl => {
      if (skipUrl === '/public/') {
        return url.includes(skipUrl);
      }
      // Para otros endpoints, verificar que termina con el endpoint exacto o tiene parámetros
      return url.includes(skipUrl) && (
        url.endsWith(skipUrl) || 
        url.includes(skipUrl + '?') || 
        url.includes(skipUrl + '/')
      );
    });
    
    console.log(`🔍 Should skip token for ${url}:`, shouldSkip);
    return shouldSkip;
  }

  /**
   * Verificar si la request tiene body
   */
  private hasRequestBody(request: HttpRequest<unknown>): boolean {
    return ['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase());
  }

  /**
   * Manejar errores HTTP
   */
  private handleHttpError(
    request: HttpRequest<unknown>, 
    next: HttpHandler, 
    error: HttpErrorResponse
  ): Observable<HttpEvent<unknown>> {
    
    if (error.status === 401) {
      return this.handle401Error(request, next, error);
    }

    if (error.status === 403) {
      return this.handle403Error(error);
    }

    // Log otros errores para debugging
    if (error.status >= 500) {
      console.error('🚨 AuthV5Interceptor: Server error:', {
        status: error.status,
        url: request.url,
        message: error.message
      });
    }

    return throwError(() => error);
  }

  /**
   * Manejar error 401 (No autorizado)
   */
  private handle401Error(
    request: HttpRequest<unknown>, 
    next: HttpHandler, 
    error: HttpErrorResponse
  ): Observable<HttpEvent<unknown>> {
    
    console.log('❌ AuthV5Interceptor: 401 Unauthorized for:', request.url);

    // Si es login, no intentar refrescar
    if (request.url.includes('/auth/login')) {
      return throwError(() => error);
    }

    // Si ya estamos refrescando, esperar
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => next.handle(this.addRequiredHeaders(request)))
      );
    }

    // Iniciar proceso de refresh
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.getCurrentUserInfo().pipe(
      switchMap(() => {
        // Token refrescado
        this.isRefreshing = false;
        this.refreshTokenSubject.next(this.tokenService.getToken());
        
        console.log('✅ AuthV5Interceptor: Token refreshed, retrying request');
        return next.handle(this.addRequiredHeaders(request));
      }),
      catchError(refreshError => {
        // Error al refrescar
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        
        console.log('❌ AuthV5Interceptor: Token refresh failed, logging out');
        
        // Logout y redirect
        this.tokenService.clearAll();
        this.router.navigate(['/v5/auth/login'], {
          queryParams: { 
            returnUrl: this.router.url,
            expired: 'true'
          }
        });
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Manejar error 403 (Prohibido)
   */
  private handle403Error(error: HttpErrorResponse): Observable<HttpEvent<unknown>> {
    console.log('❌ AuthV5Interceptor: 403 Forbidden - insufficient permissions');
    
    // Podríamos mostrar una notificación o redirigir a página de error
    // Por ahora solo loggeamos y dejamos que el componente maneje el error
    
    return throwError(() => error);
  }
}
