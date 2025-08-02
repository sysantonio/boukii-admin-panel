import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SeasonContextService } from '../services/season-context.service';

@Injectable({ providedIn: 'root' })
export class SeasonContextGuard implements CanActivate {
  constructor(private seasonContext: SeasonContextService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Temporalmente permitir acceso para desarrollo - cambiar en producción
    return true;
    
    // const seasonSelected = !!this.seasonContext.getCurrentSeason();
    // if (!seasonSelected) {
    //   this.seasonContext.promptSeasonSelection();
    //   this.router.navigate(['/v5/seasons']);
    //   return false;
    // }
    // return true;
  }
}
