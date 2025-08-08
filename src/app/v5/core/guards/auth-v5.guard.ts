import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild,
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, tap, switchMap, take } from 'rxjs/operators';
import { AuthV5Service } from '../services/auth-v5.service';
import { TokenV5Service } from '../services/token-v5.service';

@Injectable({
  providedIn: 'root'
})
export class AuthV5Guard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthV5Service,
    private tokenService: TokenV5Service,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuthentication(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuthentication(state.url);
  }

  /**
   * Verificar autenticación del usuario
   */
  private checkAuthentication(url: string): Observable<boolean | UrlTree> {
    console.log('🔐 AuthV5Guard: Checking authentication for:', url);
    
    // Debug: Verificar estado detallado del token
    const currentToken = this.tokenService.getToken();
    const hasValidToken = this.tokenService.hasValidToken();
    const isExpired = this.tokenService.isTokenExpired();
    const currentUser = this.tokenService.getCurrentUser();
    const currentSchool = this.tokenService.getCurrentSchool();
    const currentSeason = this.tokenService.getCurrentSeason();
    
    console.log('🔍 AuthV5Guard: Token state debug:', {
      hasToken: !!currentToken,
      tokenLength: currentToken?.length || 0,
      tokenStart: currentToken?.substring(0, 10) + '...' || 'N/A',
      hasValidToken,
      isExpired,
      hasUser: !!currentUser,
      userEmail: currentUser?.email || 'N/A',
      hasSchool: !!currentSchool,
      schoolName: currentSchool?.name || 'N/A',
      hasSeason: !!currentSeason,
      seasonName: currentSeason?.name || 'N/A'
    });

    // 1. Verificar si hay token válido en localStorage
    if (!this.tokenService.hasValidToken()) {
      console.log('❌ AuthV5Guard: No valid token found, checking if token is being saved...');
      console.log('🔍 AuthV5Guard: Token validation details:', {
        tokenExists: !!currentToken,
        isTokenExpired: isExpired
      });
      
      // ✅ IMPROVEMENT: Wait briefly for token to be saved (handles timing issues)
      return timer(50).pipe(
        switchMap(() => {
          // Check token again after brief delay
          const retryToken = this.tokenService.hasValidToken();
          console.log('🔄 AuthV5Guard: Retry token check after delay:', retryToken);
          
          if (retryToken) {
            console.log('✅ AuthV5Guard: Token found on retry, proceeding with auth');
            return this.proceedWithAuthentication(url);
          } else {
            console.log('❌ AuthV5Guard: Still no valid token, redirecting to login');
            return of(this.redirectToLogin(url));
          }
        })
      );
    }

    // Token found, proceed with authentication
    return this.proceedWithAuthentication(url);
  }

  /**
   * Proceder con verificación de autenticación una vez que tenemos token
   */
  private proceedWithAuthentication(url: string): Observable<boolean | UrlTree> {
    // 2. Verificar si el servicio de auth tiene el usuario cargado
    const isAuthServiceAuthenticated = this.authService.isAuthenticated();
    console.log('🔍 AuthV5Guard: Auth service state:', {
      isAuthenticated: isAuthServiceAuthenticated,
      hasCurrentUser: !!this.authService.getCurrentUser()
    });
    
    if (!isAuthServiceAuthenticated) {
      console.log('🔄 AuthV5Guard: Auth service not initialized, trying to load user info');
      
      // Intentar cargar información del usuario desde el servidor
      return this.authService.getCurrentUserInfo().pipe(
        map(user => {
          console.log('✅ AuthV5Guard: User info loaded successfully:', user.email);
          return true;
        }),
        catchError(error => {
          console.error('❌ AuthV5Guard: Failed to load user info:', error);
          
          // Si hay error 401, el token es inválido
          if (error.status === 401) {
            console.log('🔄 AuthV5Guard: Token expired, redirecting to login');
            this.tokenService.clearAll();
          }
          
          return of(this.redirectToLogin(url));
        })
      );
    }

    // 3. El usuario ya está autenticado
    console.log('✅ AuthV5Guard: User already authenticated');
    console.log('🔍 AuthV5Guard: Final auth state:', {
      tokenService: {
        hasValidToken: this.tokenService.hasValidToken(),
        hasUser: !!this.tokenService.getCurrentUser(),
        hasSchool: !!this.tokenService.getCurrentSchool(),
        hasSeason: !!this.tokenService.getCurrentSeason()
      },
      authService: {
        isAuthenticated: this.authService.isAuthenticated(),
        hasCurrentUser: !!this.authService.getCurrentUser()
      }
    });
    
    // Opcional: Refrescar token si está próximo a expirar
    return this.authService.refreshTokenIfNeeded().pipe(
      map(refreshed => {
        if (!refreshed) {
          console.log('🔄 AuthV5Guard: Token refresh failed, redirecting to login');
          return this.redirectToLogin(url);
        }
        return true;
      }),
      catchError(() => {
        console.log('❌ AuthV5Guard: Token refresh error, redirecting to login');
        return of(this.redirectToLogin(url));
      })
    );
  }

  /**
   * Redirigir al login guardando la URL de destino
   */
  private redirectToLogin(returnUrl: string): UrlTree {
    console.log('🔄 AuthV5Guard: Redirecting to login, return URL:', returnUrl);
    
    // Crear URL de login con parámetro de retorno
    return this.router.createUrlTree(['/v5/auth/login'], {
      queryParams: { returnUrl }
    });
  }
}
