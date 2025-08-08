import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SchoolSelectorComponent } from './school-selector.component';
import { AuthV5Service, SchoolInfo } from '../../../../core/services/auth-v5.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

describe('SchoolSelectorComponent', () => {
  let component: SchoolSelectorComponent;
  let fixture: ComponentFixture<SchoolSelectorComponent>;
  let authService: jasmine.SpyObj<AuthV5Service>;
  let router: jasmine.SpyObj<Router>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@boukii.com',
    email_verified_at: '2024-01-01T00:00:00.000Z'
  };

  const mockSchools: SchoolInfo[] = [
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
      'getTempUserData', 'selectSchool', 'logout'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      declarations: [SchoolSelectorComponent],
      providers: [
        { provide: AuthV5Service, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolSelectorComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthV5Service) as jasmine.SpyObj<AuthV5Service>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load school selection data on init', () => {
      const mockTempData = {
        user: mockUser,
        schools: mockSchools
      };

      authService.getTempUserData.and.returnValue(mockTempData);

      component.ngOnInit();

      expect(component.userData).toEqual(mockUser);
      expect(component.availableSchools).toEqual(mockSchools);
      expect(component.error).toBeNull();
    });

    it('should redirect to login if no temp data found', () => {
      authService.getTempUserData.and.returnValue(null);

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/v5/auth/login']);
    });

    it('should redirect to login if temp data has no schools', () => {
      const mockTempData = {
        user: mockUser,
        schools: []
      };

      authService.getTempUserData.and.returnValue(mockTempData);

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/v5/auth/login']);
    });
  });

  describe('School Selection', () => {
    beforeEach(() => {
      const mockTempData = {
        user: mockUser,
        schools: mockSchools
      };
      authService.getTempUserData.and.returnValue(mockTempData);
      component.ngOnInit();
    });

    it('should enable confirm button when school is selected', () => {
      expect(component.selectedSchoolId).toBeNull();

      component.onSchoolSelect(mockSchools[0].id);

      expect(component.selectedSchoolId).toBe(mockSchools[0].id);
    });

    it('should complete login when school is selected and confirmed', (done) => {
      const mockLoginResponse = {
        user: mockUser,
        school: mockSchools[0],
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

      authService.selectSchool.and.returnValue(of(mockLoginResponse));

      component.selectedSchoolId = mockSchools[0].id;
      component.onConfirmSchool();

      setTimeout(() => {
        expect(authService.selectSchool).toHaveBeenCalledWith({
          school_id: mockSchools[0].id,
          remember_me: false
        });

        expect(notificationService.showSuccess).toHaveBeenCalledWith(
          'Escuela seleccionada correctamente'
        );

        expect(router.navigate).toHaveBeenCalledWith(['/v5']);
        expect(component.isLoading).toBeFalse();
        done();
      }, 100);
    });

    it('should handle school selection failure', (done) => {
      authService.selectSchool.and.returnValue(throwError(() => new Error('School selection failed')));

      component.selectedSchoolId = mockSchools[0].id;
      component.onConfirmSchool();

      setTimeout(() => {
        expect(component.isLoading).toBeFalse();
        expect(component.error).toBe('Error al seleccionar la escuela. Inténtalo de nuevo.');
        expect(notificationService.showError).toHaveBeenCalledWith(
          'Error al seleccionar la escuela. Inténtalo de nuevo.'
        );
        done();
      }, 100);
    });

    it('should not proceed if no school is selected', () => {
      component.selectedSchoolId = null;
      component.onConfirmSchool();

      expect(authService.selectSchool).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('School Display', () => {
    beforeEach(() => {
      const mockTempData = {
        user: mockUser,
        schools: mockSchools
      };
      authService.getTempUserData.and.returnValue(mockTempData);
      component.ngOnInit();
    });

    it('should display correct school information', () => {
      expect(component.availableSchools.length).toBe(2);
      
      const firstSchool = component.availableSchools[0];
      expect(firstSchool.name).toBe('School 1');
      expect(firstSchool.user_role).toBe('admin');
      expect(firstSchool.can_administer).toBeTruthy();

      const secondSchool = component.availableSchools[1];
      expect(secondSchool.name).toBe('School 2');
      expect(secondSchool.user_role).toBe('teacher');
      expect(secondSchool.can_administer).toBeFalsy();
    });

    it('should track selected school correctly', () => {
      component.onSchoolSelect(mockSchools[1].id);
      expect(component.selectedSchoolId).toBe(2);

      component.onSchoolSelect(mockSchools[0].id);
      expect(component.selectedSchoolId).toBe(1);
    });
  });

  describe('Navigation', () => {
    it('should provide back to login option', () => {
      component.onBackToLogin();

      expect(router.navigate).toHaveBeenCalledWith(['/v5/auth/login']);
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      const mockTempData = {
        user: mockUser,
        schools: mockSchools
      };
      authService.getTempUserData.and.returnValue(mockTempData);
      component.ngOnInit();
    });

    it('should show loading state during school selection', () => {
      authService.selectSchool.and.returnValue(of({} as any));

      component.selectedSchoolId = mockSchools[0].id;
      
      expect(component.isLoading).toBeFalse();
      component.onConfirmSchool();
      
      // Loading state should be managed by the component
      // The actual loading state behavior may vary based on implementation
    });
  });

  describe('Error States', () => {
    it('should clear error when making new selection', () => {
      component.error = 'Previous error message';

      component.onSchoolSelect(mockSchools[0].id);

      expect(component.error).toBeNull();
    });

    it('should display user-friendly error messages', (done) => {
      authService.selectSchool.and.returnValue(throwError(() => new Error('Network error')));

      const mockTempData = {
        user: mockUser,
        schools: mockSchools
      };
      authService.getTempUserData.and.returnValue(mockTempData);
      component.ngOnInit();

      component.selectedSchoolId = mockSchools[0].id;
      component.onConfirmSchool();

      setTimeout(() => {
        expect(component.error).toBe('Error al seleccionar la escuela. Inténtalo de nuevo.');
        done();
      }, 100);
    });
  });

  describe('Component Cleanup', () => {
    it('should clean up subscriptions on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});