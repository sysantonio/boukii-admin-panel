import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild,
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { TokenV5Service, SeasonContext } from '../services/token-v5.service';

@Injectable({
  providedIn: 'root'
})
export class SeasonContextGuard implements CanActivate, CanActivateChild {

  constructor(
    private tokenService: TokenV5Service,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkSeasonContext(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkSeasonContext(state.url);
  }

  /**
   * Verificar que existe un contexto de temporada válido
   */
  private checkSeasonContext(url: string): Observable<boolean | UrlTree> {
    console.log('📅 SeasonContextGuard: Checking season context for:', url);

    const season = this.tokenService.getCurrentSeason();
    const school = this.tokenService.getCurrentSchool();

    if (!season) {
      console.log('❌ SeasonContextGuard: No season context found');
      return of(this.redirectToSeasonSelection(url));
    }

    if (!school) {
      console.log('❌ SeasonContextGuard: No school context found');
      return of(this.redirectToLogin(url));
    }

    // Verificar que la temporada esté activa
    if (!season.is_active) {
      console.log('⚠️ SeasonContextGuard: Season is not active:', season.name);
      return of(this.redirectToSeasonSelection(url, 'La temporada seleccionada no está activa'));
    }

    // Verificar que la temporada pertenezca a la escuela (si tenemos esa información)
    // En este caso confiamos en que el backend ya validó esto durante el login

    console.log('✅ SeasonContextGuard: Valid season context:', {
      season: season.name,
      school: school.name,
      seasonActive: season.is_active
    });

    return of(true);
  }

  /**
   * Redirigir a la selección de temporada
   */
  private redirectToSeasonSelection(returnUrl: string, message?: string): UrlTree {
    console.log('🔄 SeasonContextGuard: Redirecting to season selection, return URL:', returnUrl);
    
    const queryParams: any = { returnUrl };
    if (message) {
      queryParams.message = message;
    }

    return this.router.createUrlTree(['/v5/seasons/select'], {
      queryParams
    });
  }

  /**
   * Redirigir al login si no hay contexto de escuela
   */
  private redirectToLogin(returnUrl: string): UrlTree {
    console.log('🔄 SeasonContextGuard: No school context, redirecting to login');
    
    return this.router.createUrlTree(['/v5/auth/login'], {
      queryParams: { returnUrl }
    });
  }
}
