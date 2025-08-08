import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthV5Service, SchoolInfo, CheckUserResponse } from '../../../../core/services/auth-v5.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-school-selector',
  templateUrl: './school-selector.component.html',
  styleUrls: ['./school-selector.component.scss']
})
export class SchoolSelectorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  availableSchools: SchoolInfo[] = [];
  selectedSchoolId: number | null = null;
  isLoading = false;
  error: string | null = null;
  userData: any = null;

  constructor(
    private authService: AuthV5Service,
    private router: Router,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadSchoolSelectionData();
    this.subscribeToAuthState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar datos de selección de escuela desde el estado de autenticación
   */
  private loadSchoolSelectionData(): void {
    // Obtener datos temporales del localStorage o estado del servicio
    const tempData = this.authService.getTempUserData();
    
    if (tempData && tempData.schools) {
      this.userData = tempData.user;
      this.availableSchools = tempData.schools;
      console.log('📚 Loaded school selection data:', {
        user: this.userData,
        schools: this.availableSchools
      });
    } else {
      console.warn('⚠️ No temp data found, redirecting to login');
      this.router.navigate(['/v5/auth/login']);
    }
  }

  /**
   * Suscribirse a cambios en el estado de autenticación
   */
  private subscribeToAuthState(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isLoading = state.isLoading;
        this.error = state.error;
        
        // Si el login se completa exitosamente, redirigir al dashboard
        if (state.isAuthenticated && !state.isLoading) {
          this.onLoginSuccess();
        }
      });
  }

  /**
   * Seleccionar una escuela
   */
  selectSchool(schoolId: number): void {
    this.selectedSchoolId = schoolId;
  }

  /**
   * Confirmar selección de escuela y completar login
   */
  confirmSchoolSelection(): void {
    if (!this.selectedSchoolId) {
      this.notificationService.showError('Por favor selecciona una escuela');
      return;
    }

    this.clearError();
    
    const schoolData = {
      school_id: this.selectedSchoolId,
      remember_me: false // TODO: Obtener de un checkbox si es necesario
    };

    console.log('🔄 Starting school selection...', schoolData);
    console.log('🔍 Current tokens:', {
      token: this.authService['tokenService'].getToken(),
      tempToken: this.authService['tokenService'].getTempToken(),
      currentToken: this.authService['tokenService'].getCurrentToken()
    });

    this.authService.selectSchool(schoolData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ School selection successful', response);
          this.notificationService.showSuccess(`Acceso exitoso a ${response.school.name}`);
          // La redirección se maneja en subscribeToAuthState
        },
        error: (error) => {
          console.error('❌ School selection failed', error);
          console.error('❌ Full error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          this.error = error.message || 'Failed to select school';
          this.notificationService.showError(this.error);
        }
      });
  }

  /**
   * Cancelar selección y volver al login
   */
  cancelSelection(): void {
    // Limpiar datos de autenticación temporal
    this.authService.logout(false);
    this.router.navigate(['/v5/auth/login']);
  }

  /**
   * Limpiar errores
   */
  clearError(): void {
    this.error = null;
    this.authService.clearError();
  }

  /**
   * Manejar login exitoso
   */
  private onLoginSuccess(): void {
    // ✅ FIXED: Wait for token to be saved before navigation to avoid timing issues
    console.log('🔄 SchoolSelector: Waiting for token to be saved before navigation...');
    setTimeout(() => {
      // Redirigir al dashboard V5 after token is saved
      console.log('🏙 SchoolSelector: Navigating to dashboard');
      this.router.navigate(['/v5/dashboard']);
    }, 100); // Small delay to ensure token is saved
  }

  /**
   * Obtener escuela seleccionada
   */
  getSelectedSchool(): SchoolInfo | null {
    if (!this.selectedSchoolId) return null;
    return this.availableSchools.find(school => school.id === this.selectedSchoolId) || null;
  }

  /**
   * Verificar si una escuela está seleccionada
   */
  isSchoolSelected(schoolId: number): boolean {
    return this.selectedSchoolId === schoolId;
  }
}