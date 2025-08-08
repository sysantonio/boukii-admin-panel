import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermissionsV5Service } from '../services/permissions-v5.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionsV5Guard implements CanActivate {

  constructor(
    private permissionsService: PermissionsV5Service,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.permissionsService.permissions$.pipe(
      take(1),
      map(permissions => {
        if (!permissions) {
          console.warn('🚫 PermissionsV5Guard: No permissions loaded');
          this.showPermissionError('Permisos no disponibles. Inténtalo de nuevo.');
          this.router.navigate(['/v5/welcome']);
          return false;
        }

        const canAccess = this.permissionsService.canAccessRoute(state.url);
        
        if (!canAccess) {
          console.warn(`🚫 PermissionsV5Guard: Access denied to ${state.url}`);
          
          // Show specific error message
          const errorMessage = this.permissionsService.getPermissionErrorMessage(state.url);
          this.showPermissionError(errorMessage);
          
          // Redirect to welcome if they can't access this route
          this.router.navigate(['/v5/welcome']);
          return false;
        }

        console.log(`✅ PermissionsV5Guard: Access granted to ${state.url}`);
        return true;
      })
    );
  }

  private showPermissionError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}