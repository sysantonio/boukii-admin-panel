import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthV5Service } from '../services/auth-v5.service';

@Injectable({ providedIn: 'root' })
export class AuthV5Guard implements CanActivate {
  constructor(private authService: AuthV5Service, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Temporalmente permitir acceso para desarrollo - cambiar en producción
    return true;
    
    // const isLogged = this.authService.isAuthenticated();
    // if (!isLogged) {
    //   this.router.navigate(['/login']);
    //   return false;
    // }
    // return true;
  }
}
