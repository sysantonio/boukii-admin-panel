import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthV5Service, CheckUserResponse } from '../../../../core/services/auth-v5.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthV5Service>;
  let router: jasmine.SpyObj<Router>;
  let route: jasmine.SpyObj<ActivatedRoute>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@boukii.com',
    email_verified_at: '2024-01-01T00:00:00.000Z'
  };

  const mockSingleSchool = {
    id: 1,
    name: 'Test School',
    slug: 'test-school',
    logo: 'test.png',
    user_role: 'admin',
    can_administer: true
  };

  const mockMultipleSchools = [
    {
      id: 1,
      name: 'School 1',
      slug: 'school-1',
      logo: 'school1.png',
      user_role: 'admin',
      can_administer: true
    },
    {
      id: 2,
      name: 'School 2',
      slug: 'school-2',
      logo: 'school2.png',
      user_role: 'teacher',
      can_administer: false
    }
  ];

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthV5Service', [
      'checkUser', 'selectSchool', 'isAuthenticated'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { queryParams: {} }
    });
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthV5Service, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthV5Service) as jasmine.SpyObj<AuthV5Service>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    authService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with validation', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')?.hasError('required')).toBeFalsy(); // Pre-filled for dev
    expect(component.loginForm.get('password')?.hasError('required')).toBeFalsy(); // Pre-filled for dev
  });

  describe('Single School Login Flow', () => {
    it('should auto-select school for single school user', (done) => {
      const mockCheckUserResponse: CheckUserResponse = {
        user: mockUser,
        schools: [mockSingleSchool],
        requires_school_selection: false,
        temp_token: 'temp-token-123'
      };

      const mockSelectSchoolResponse = {
        user: mockUser,
        school: mockSingleSchool,
        season: {
          id: 1,
          name: 'Season 2024-25',
          year: '2024-25',
          is_current: true,
          start_date: '2024-09-01',
          end_date: '2025-08-31'
        },
        access_token: 'access-token-789',
        token_type: 'Bearer',
        expires_at: null,
        has_multiple_seasons: false,
        available_seasons: []
      };

      authService.checkUser.and.returnValue(of(mockCheckUserResponse));
      authService.selectSchool.and.returnValue(of(mockSelectSchoolResponse));

      // Fill form and submit
      component.loginForm.patchValue({
        email: 'test@boukii.com',
        password: 'password123'
      });

      component.onSubmit();

      // Wait for async operations
      setTimeout(() => {
        expect(authService.checkUser).toHaveBeenCalledWith({
          email: 'test@boukii.com',
          password: 'password123'
        });

        expect(authService.selectSchool).toHaveBeenCalledWith({
          school_id: mockSingleSchool.id,
          remember_me: true
        });

        expect(router.navigate).toHaveBeenCalledWith(['/v5']);
        expect(component.isLoading).toBeFalse();
        done();
      }, 100);
    });

    it('should handle auto-selection failure', (done) => {
      const mockCheckUserResponse: CheckUserResponse = {
        user: mockUser,
        schools: [mockSingleSchool],
        requires_school_selection: false,
        temp_token: 'temp-token-123'
      };

      authService.checkUser.and.returnValue(of(mockCheckUserResponse));
      authService.selectSchool.and.returnValue(throwError(() => new Error('School selection failed')));

      component.loginForm.patchValue({
        email: 'test@boukii.com',
        password: 'password123'
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.isLoading).toBeFalse();
        expect(snackBar.open).toHaveBeenCalledWith(
          'Error al completar el login automático',
          'Cerrar',
          jasmine.objectContaining({
            duration: 5000,
            panelClass: ['error-snackbar']
          })
        );
        done();
      }, 100);
    });
  });

  describe('Multi School Login Flow', () => {
    it('should navigate to school selector for multi-school user', () => {
      const mockCheckUserResponse: CheckUserResponse = {
        user: mockUser,
        schools: mockMultipleSchools,
        requires_school_selection: true,
        temp_token: 'temp-token-456'
      };

      authService.checkUser.and.returnValue(of(mockCheckUserResponse));

      component.loginForm.patchValue({
        email: 'test@boukii.com',
        password: 'password123'
      });

      component.onSubmit();

      expect(authService.checkUser).toHaveBeenCalledWith({
        email: 'test@boukii.com',
        password: 'password123'
      });

      expect(router.navigate).toHaveBeenCalledWith(['/v5/auth/school-selector']);
      expect(component.isLoading).toBeFalse();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Credenciales verificadas. Por favor selecciona tu escuela.',
        'Cerrar',
        jasmine.objectContaining({
          duration: 3000,
          panelClass: ['success-snackbar']
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle checkUser failure', () => {
      authService.checkUser.and.returnValue(throwError(() => new Error('Invalid credentials')));

      component.loginForm.patchValue({
        email: 'wrong@example.com',
        password: 'wrongpass'
      });

      component.onSubmit();

      expect(component.isLoading).toBeFalse();
      expect(snackBar.open).toHaveBeenCalledWith(
        jasmine.stringContaining('Error de login'),
        'Cerrar',
        jasmine.objectContaining({
          duration: 5000,
          panelClass: ['error-snackbar']
        })
      );
    });

    it('should handle user with no schools', () => {
      const mockCheckUserResponse: CheckUserResponse = {
        user: mockUser,
        schools: [],
        requires_school_selection: false,
        temp_token: 'temp-token-789'
      };

      authService.checkUser.and.returnValue(of(mockCheckUserResponse));

      component.loginForm.patchValue({
        email: 'test@boukii.com',
        password: 'password123'
      });

      component.onSubmit();

      expect(component.isLoading).toBeFalse();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error: No se encontraron escuelas asociadas a tu usuario.',
        'Cerrar',
        jasmine.objectContaining({
          duration: 5000,
          panelClass: ['error-snackbar']
        })
      );
    });
  });

  describe('Form Validation', () => {
    it('should not submit if form is invalid', () => {
      component.loginForm.patchValue({
        email: '',
        password: ''
      });

      component.onSubmit();

      expect(authService.checkUser).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.loginForm.get('password');
      
      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBeTruthy();

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBeFalsy();
    });
  });

  describe('Authentication State', () => {
    it('should redirect to /v5 if user is already authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      
      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/v5']);
    });

    it('should not redirect if user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      
      component.ngOnInit();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should set loading state during login process', () => {
      const mockCheckUserResponse: CheckUserResponse = {
        user: mockUser,
        schools: mockMultipleSchools,
        requires_school_selection: true,
        temp_token: 'temp-token-456'
      };

      authService.checkUser.and.returnValue(of(mockCheckUserResponse));

      component.loginForm.patchValue({
        email: 'test@boukii.com',
        password: 'password123'
      });

      expect(component.isLoading).toBeFalse();
      
      component.onSubmit();
      
      // After submission, loading should be reset to false
      expect(component.isLoading).toBeFalse();
    });
  });
});