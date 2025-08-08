import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthV5Service } from '../../../../core/services/auth-v5.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthV5Service,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/v5']);
    }

    // Pre-fill with test credentials for development
    this.loginForm.patchValue({
      email: 'admin@boukii-v5.com',
      password: 'password123'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      // Use checkUser for the new V5 flow with automatic school detection
      this.authService.checkUser({
        email,
        password
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Check user successful:', response);
            
            if (response.requires_school_selection && response.schools && response.schools.length > 1) {
              console.log('🔄 Multi-school user - school selection required');
              this.isLoading = false;
              this.snackBar.open('Credenciales verificadas. Por favor selecciona tu escuela.', 'Cerrar', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              
              // Navigate to school selection
              this.router.navigate(['/v5/auth/school-selector']);
            } else if (response.schools && response.schools.length === 1) {
              console.log('✅ Single school user - auto-selecting school');
              
              // Automatically select the single school to complete login
              this.authService.selectSchool({
                school_id: response.schools[0].id,
                remember_me: true
              })
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (loginResponse) => {
                  console.log('✅ Auto school selection successful:', loginResponse);
                  this.isLoading = false;
                  this.snackBar.open('Login exitoso', 'Cerrar', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                  });
                  
                  // ✅ FIXED: Wait for token to be saved before navigation to avoid timing issues
                  console.log('🔄 LoginComponent: Waiting for token to be saved before navigation...');
                  setTimeout(() => {
                    // Navigate to intended destination after token is saved
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/v5';
                    console.log('🏙 LoginComponent: Navigating to:', returnUrl);
                    this.router.navigate([returnUrl]);
                  }, 100); // Small delay to ensure token is saved
                },
                error: (selectError) => {
                  console.error('❌ Auto school selection failed:', selectError);
                  this.isLoading = false;
                  this.snackBar.open('Error al completar el login automático', 'Cerrar', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                  });
                }
              });
            } else {
              console.error('❌ No schools found for user');
              this.isLoading = false;
              this.snackBar.open('Error: No se encontraron escuelas asociadas a tu usuario.', 'Cerrar', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('❌ Login error:', error);
            this.isLoading = false;
            
            let errorMessage = 'Error de login. Verifica tu email y contraseña.';
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }

            this.snackBar.open(errorMessage, 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError('required')) {
      return `${field} es requerido`;
    }
    if (control?.hasError('email')) {
      return 'Email no válido';
    }
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }
}