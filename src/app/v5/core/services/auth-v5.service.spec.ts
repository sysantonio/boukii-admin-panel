import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthV5Service, LoginRequest, InitialLoginRequest, SeasonSelectionRequest, SeasonInfo, InitialLoginResponse } from './auth-v5.service';
import { TokenV5Service, LoginResponse } from './token-v5.service';
import { environment } from '../../../../environments/environment';

describe('AuthV5Service', () => {
  let service: AuthV5Service;
  let httpMock: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<TokenV5Service>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLoginResponse: LoginResponse = {
    access_token: 'mock-token-12345',
    token_type: 'Bearer',
    expires_at: '2025-01-04T12:00:00Z',
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'school_admin',
      permissions: ['manage_courses', 'manage_bookings'],
      avatar_url: 'https://example.com/avatar.jpg'
    },
    school: {
      id: 1,
      name: 'Test School',
      slug: 'test-school',
      logo_url: 'https://example.com/logo.jpg',
      timezone: 'Europe/Madrid',
      currency: 'EUR'
    },
    season: {
      id: 5,
      name: 'Season 2024-2025',
      start_date: '2024-09-01',
      end_date: '2025-08-31',
      is_active: true,
      is_current: true
    }
  };

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123',
    school_id: 1,
    season_id: 5,
    remember_me: false
  };

  const mockInitialLoginRequest: InitialLoginRequest = {
    email: 'test@example.com',
    password: 'password123',
    school_id: 1,
    remember_me: false
  };

  const mockAvailableSeasons: SeasonInfo[] = [
    {
      id: 5,
      name: 'Season 2024-2025',
      start_date: '2024-09-01',
      end_date: '2025-08-31',
      is_active: true,
      is_current: true
    },
    {
      id: 6,
      name: 'Season 2025-2026',
      start_date: '2025-09-01',
      end_date: '2026-08-31',
      is_active: true,
      is_current: false
    }
  ];

  const mockInitialLoginResponse: InitialLoginResponse = {
    access_token: 'temp-token-12345',
    token_type: 'Bearer',
    expires_at: '2025-01-04T12:00:00Z',
    requires_season_selection: true,
    available_seasons: mockAvailableSeasons,
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'school_admin',
      permissions: ['manage_courses', 'manage_bookings'],
      avatar_url: 'https://example.com/avatar.jpg'
    },
    school: {
      id: 1,
      name: 'Test School',
      slug: 'test-school',
      logo_url: 'https://example.com/logo.jpg',
      timezone: 'Europe/Madrid',
      currency: 'EUR'
    }
  };

  beforeEach(() => {
    const tokenServiceSpyObj = jasmine.createSpyObj('TokenV5Service', [
      'hasValidToken',
      'getCurrentUser',
      'getCurrentSchool',
      'getCurrentSeason',
      'saveLoginData',
      'savePartialLoginData',
      'clearAll',
      'getToken',
      'updateUserData',
      'getTokenExpirationInfo'
    ]);

    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthV5Service,
        { provide: TokenV5Service, useValue: tokenServiceSpyObj },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthV5Service);
    httpMock = TestBed.inject(HttpTestingController);
    tokenServiceSpy = TestBed.inject(TokenV5Service) as jasmine.SpyObj<TokenV5Service>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize auth state from token service', () => {
      tokenServiceSpy.hasValidToken.and.returnValue(true);
      tokenServiceSpy.getCurrentUser.and.returnValue(mockLoginResponse.user);

      service = TestBed.inject(AuthV5Service); // Reinicializar para trigger constructor

      service.authState$.subscribe(state => {
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockLoginResponse.user);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    it('should initialize as not authenticated when no valid token', () => {
      tokenServiceSpy.hasValidToken.and.returnValue(false);
      tokenServiceSpy.getCurrentUser.and.returnValue(null);

      service = TestBed.inject(AuthV5Service);

      service.authState$.subscribe(state => {
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
      });
    });
  });

  describe('login', () => {
    it('should perform successful login', () => {
      const expectedUrl = `${environment.apiUrl}/v5/auth/login`;

      service.login(mockLoginRequest).subscribe(response => {
        expect(response).toEqual(mockLoginResponse);
        expect(tokenServiceSpy.saveLoginData).toHaveBeenCalledWith(mockLoginResponse);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);

      req.flush({
        success: true,
        message: 'Login successful',
        data: mockLoginResponse
      });

      // Verify auth state was updated
      service.authState$.subscribe(state => {
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockLoginResponse.user);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    it('should handle login failure', () => {
      const errorMessage = 'Invalid credentials';

      service.login(mockLoginRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/login`);
      req.flush({
        success: false,
        message: errorMessage
      }, { status: 401, statusText: 'Unauthorized' });

      // Verify auth state shows error
      service.authState$.subscribe(state => {
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
        expect(state.error).toBe(errorMessage);
        expect(state.isLoading).toBe(false);
      });
    });

    it('should set loading state during login', () => {
      let loadingStates: boolean[] = [];

      service.authState$.subscribe(state => {
        loadingStates.push(state.isLoading);
      });

      service.login(mockLoginRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/login`);
      req.flush({
        success: true,
        message: 'Login successful',
        data: mockLoginResponse
      });

      // Should have loading states: false (initial), true (during request), false (after request)
      expect(loadingStates).toContain(true);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });

    it('should handle HTTP error responses', () => {
      service.login(mockLoginRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Invalid credentials or session expired');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should perform successful server logout', () => {
      tokenServiceSpy.getToken.and.returnValue('mock-token');

      service.logout().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/logout`);
      expect(req.request.method).toBe('POST');

      req.flush({
        success: true,
        message: 'Logout successful'
      });

      expect(tokenServiceSpy.clearAll).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/v5/auth/login']);
    });

    it('should perform local logout when no token', () => {
      tokenServiceSpy.getToken.and.returnValue(null);

      service.logout().subscribe();

      httpMock.expectNone(`${environment.apiUrl}/v5/auth/logout`);
      expect(tokenServiceSpy.clearAll).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/v5/auth/login']);
    });

    it('should handle server logout failure gracefully', () => {
      tokenServiceSpy.getToken.and.returnValue('mock-token');

      service.logout().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/logout`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // Should still perform local logout
      expect(tokenServiceSpy.clearAll).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/v5/auth/login']);
    });

    it('should not navigate when navigateToLogin is false', () => {
      tokenServiceSpy.getToken.and.returnValue('mock-token');

      service.logout(false).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/logout`);
      req.flush({ success: true });

      expect(tokenServiceSpy.clearAll).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUserInfo', () => {
    it('should fetch and update user info', () => {
      const updatedUser = { ...mockLoginResponse.user, name: 'Updated Name' };

      service.getCurrentUserInfo().subscribe(user => {
        expect(user).toEqual(updatedUser);
        expect(tokenServiceSpy.updateUserData).toHaveBeenCalledWith(updatedUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/me`);
      expect(req.request.method).toBe('GET');

      req.flush({
        success: true,
        data: { user: updatedUser }
      });
    });

    it('should handle 401 error by logging out', () => {
      service.getCurrentUserInfo().subscribe({
        next: () => fail('Should have failed'),
        error: () => {
          expect(tokenServiceSpy.clearAll).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/v5/auth/login']);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/me`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('authentication checks', () => {
    it('should return correct authentication status', () => {
      // Mock authenticated state
      service['updateAuthState']({
        isAuthenticated: true,
        isLoading: false,
        user: mockLoginResponse.user,
        error: null
      });

      expect(service.isAuthenticated()).toBe(true);
      expect(service.getCurrentUser()).toEqual(mockLoginResponse.user);
    });

    it('should return false when not authenticated', () => {
      service['updateAuthState']({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });

      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBe(null);
    });
  });

  describe('permission checks', () => {
    beforeEach(() => {
      service['updateAuthState']({
        isAuthenticated: true,
        isLoading: false,
        user: mockLoginResponse.user,
        error: null
      });
    });

    it('should delegate permission checks to token service', () => {
      tokenServiceSpy.hasPermission.and.returnValue(true);
      tokenServiceSpy.hasAnyPermission.and.returnValue(true);
      tokenServiceSpy.hasRole.and.returnValue(true);
      tokenServiceSpy.hasAnyRole.and.returnValue(true);

      expect(service.hasPermission('manage_courses')).toBe(true);
      expect(service.hasAnyPermission(['manage_courses'])).toBe(true);
      expect(service.hasRole('school_admin')).toBe(true);
      expect(service.hasAnyRole(['school_admin'])).toBe(true);

      expect(tokenServiceSpy.hasPermission).toHaveBeenCalledWith('manage_courses');
      expect(tokenServiceSpy.hasAnyPermission).toHaveBeenCalledWith(['manage_courses']);
      expect(tokenServiceSpy.hasRole).toHaveBeenCalledWith('school_admin');
      expect(tokenServiceSpy.hasAnyRole).toHaveBeenCalledWith(['school_admin']);
    });
  });

  describe('token refresh', () => {
    it('should refresh token when valid', () => {
      tokenServiceSpy.hasValidToken.and.returnValue(true);
      tokenServiceSpy.getTokenExpirationInfo.and.returnValue({
        expires_at: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes from now
        minutes_remaining: 25
      });

      service.refreshTokenIfNeeded().subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/me`);
      req.flush({
        success: true,
        data: { user: mockLoginResponse.user }
      });
    });

    it('should logout when token is invalid', () => {
      tokenServiceSpy.hasValidToken.and.returnValue(false);

      service.refreshTokenIfNeeded().subscribe(result => {
        expect(result).toBe(false);
        expect(tokenServiceSpy.clearAll).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/v5/auth/login']);
      });

      httpMock.expectNone(`${environment.apiUrl}/v5/auth/me`);
    });
  });

  describe('currentUser$ observable', () => {
    it('should emit current user from auth state', () => {
      const testUser = mockLoginResponse.user;
      
      service['updateAuthState']({
        isAuthenticated: true,
        isLoading: false,
        user: testUser,
        error: null
      });

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(testUser);
      });
    });

    it('should emit null when no user is authenticated', () => {
      service['updateAuthState']({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });

      service.currentUser$.subscribe(user => {
        expect(user).toBe(null);
      });
    });

    it('should emit updated user when auth state changes', () => {
      const users: any[] = [];
      
      service.currentUser$.subscribe(user => {
        users.push(user);
      });

      // Initial state (null)
      service['updateAuthState']({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });

      // Login
      service['updateAuthState']({
        isAuthenticated: true,
        isLoading: false,
        user: mockLoginResponse.user,
        error: null
      });

      // User update
      const updatedUser = { ...mockLoginResponse.user, name: 'Updated Name' };
      service['updateAuthState']({
        isAuthenticated: true,
        isLoading: false,
        user: updatedUser,
        error: null
      });

      expect(users).toContain(null);
      expect(users).toContain(mockLoginResponse.user);
      expect(users).toContain(updatedUser);
    });
  });

  describe('logUserAction', () => {
    beforeEach(() => {
      tokenServiceSpy.getCurrentSchool.and.returnValue(mockLoginResponse.school);
      tokenServiceSpy.getCurrentSeason.and.returnValue(mockLoginResponse.season);
      
      service['updateAuthState']({
        isAuthenticated: true,
        isLoading: false,
        user: mockLoginResponse.user,
        error: null
      });
    });

    it('should log user action successfully', () => {
      const action = 'dashboard_viewed';
      const payload = { userId: 1, userName: 'Test User' };

      service.logUserAction(action, payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/user/logs`);
      expect(req.request.method).toBe('POST');
      
      const requestBody = req.request.body;
      expect(requestBody.action).toBe(action);
      expect(requestBody.payload).toEqual(payload);
      expect(requestBody.user_id).toBe(mockLoginResponse.user.id);
      expect(requestBody.user_email).toBe(mockLoginResponse.user.email);
      expect(requestBody.school_id).toBe(mockLoginResponse.school.id);
      expect(requestBody.school_name).toBe(mockLoginResponse.school.name);
      expect(requestBody.season_id).toBe(mockLoginResponse.season.id);
      expect(requestBody.season_name).toBe(mockLoginResponse.season.name);
      expect(requestBody.timestamp).toBeDefined();
      expect(requestBody.user_agent).toBe(navigator.userAgent);
      expect(requestBody.url).toBe(window.location.href);

      req.flush({
        success: true,
        message: 'Action logged successfully'
      });
    });

    it('should log action with empty payload when none provided', () => {
      const action = 'simple_action';

      service.logUserAction(action).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/user/logs`);
      const requestBody = req.request.body;
      
      expect(requestBody.action).toBe(action);
      expect(requestBody.payload).toEqual({});

      req.flush({ success: true });
    });

    it('should handle logging errors gracefully', () => {
      const action = 'test_action';

      service.logUserAction(action).subscribe({
        next: (result) => {
          expect(result).toBeUndefined();
        },
        error: () => fail('Should not error out')
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/user/logs`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should not make HTTP request when user is not authenticated', () => {
      service['updateAuthState']({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });

      service.logUserAction('test_action').subscribe(result => {
        expect(result).toBeUndefined();
      });

      httpMock.expectNone(`${environment.apiUrl}/v5/user/logs`);
    });

    it('should include school and season data when available', () => {
      const mockSchool = { id: 2, name: 'Another School', slug: 'another-school' };
      const mockSeason = { id: 6, name: 'Season 2025-2026', start_date: '2025-09-01', end_date: '2026-08-31', is_active: true };
      
      tokenServiceSpy.getCurrentSchool.and.returnValue(mockSchool);
      tokenServiceSpy.getCurrentSeason.and.returnValue(mockSeason);

      service.logUserAction('test_with_context').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/user/logs`);
      const requestBody = req.request.body;
      
      expect(requestBody.school_id).toBe(mockSchool.id);
      expect(requestBody.school_name).toBe(mockSchool.name);
      expect(requestBody.season_id).toBe(mockSeason.id);
      expect(requestBody.season_name).toBe(mockSeason.name);

      req.flush({ success: true });
    });

    it('should handle missing school and season gracefully', () => {
      tokenServiceSpy.getCurrentSchool.and.returnValue(null);
      tokenServiceSpy.getCurrentSeason.and.returnValue(null);

      service.logUserAction('test_no_context').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/user/logs`);
      const requestBody = req.request.body;
      
      expect(requestBody.school_id).toBeUndefined();
      expect(requestBody.school_name).toBeUndefined();
      expect(requestBody.season_id).toBeUndefined();
      expect(requestBody.season_name).toBeUndefined();

      req.flush({ success: true });
    });
  });

  describe('getCurrentSchool and getCurrentSeason', () => {
    it('should delegate getCurrentSchool to token service', () => {
      const mockSchool = mockLoginResponse.school;
      tokenServiceSpy.getCurrentSchool.and.returnValue(mockSchool);

      const result = service.getCurrentSchool();

      expect(result).toBe(mockSchool);
      expect(tokenServiceSpy.getCurrentSchool).toHaveBeenCalled();
    });

    it('should delegate getCurrentSeason to token service', () => {
      const mockSeason = mockLoginResponse.season;
      tokenServiceSpy.getCurrentSeason.and.returnValue(mockSeason);

      const result = service.getCurrentSeason();

      expect(result).toBe(mockSeason);
      expect(tokenServiceSpy.getCurrentSeason).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should clear error state', () => {
      service['updateAuthState']({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: 'Some error'
      });

      service.clearError();

      service.authState$.subscribe(state => {
        expect(state.error).toBe(null);
      });
    });

    it('should extract error messages correctly', () => {
      const testCases = [
        { status: 401, expected: 'Invalid credentials or session expired' },
        { status: 403, expected: 'Access denied. Check your permissions.' },
        { status: 422, expected: 'Invalid data provided. Please check your input.' },
        { status: 500, expected: 'Server error. Please try again later.' },
        { status: 0, expected: 'Connection error. Please check your internet connection.' },
        { status: 418, expected: 'An error occurred (418). Please try again.' }
      ];

      testCases.forEach(testCase => {
        service.login(mockLoginRequest).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.message).toBe(testCase.expected);
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/login`);
        req.flush('Error', { status: testCase.status, statusText: 'Error' });
      });
    });
  });

  // ===============================
  // NEW SEASON SELECTION TESTS
  // ===============================

  describe('Season Selection Flow', () => {
    describe('initialLogin', () => {
      it('should perform successful initial login requiring season selection', () => {
        const expectedUrl = `${environment.apiUrl}/v5/auth/initial-login`;

        service.initialLogin(mockInitialLoginRequest).subscribe(response => {
          expect(response).toEqual(mockInitialLoginResponse);
          expect(tokenServiceSpy.savePartialLoginData).toHaveBeenCalledWith(mockInitialLoginResponse);
        });

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockInitialLoginRequest);

        req.flush({
          success: true,
          message: 'Initial login successful',
          data: mockInitialLoginResponse
        });

        // Verify auth state was updated
        service.authState$.subscribe(state => {
          expect(state.isAuthenticated).toBe(true);
          expect(state.user).toEqual(mockInitialLoginResponse.user);
          expect(state.isLoading).toBe(false);
          expect(state.error).toBe(null);
        });
      });

      it('should perform successful initial login with existing valid season (completes automatically)', () => {
        const completeLoginResponse: InitialLoginResponse = {
          ...mockInitialLoginResponse,
          requires_season_selection: false,
          current_season: mockAvailableSeasons[0]
        };

        service.initialLogin(mockInitialLoginRequest).subscribe(response => {
          expect(response).toEqual(completeLoginResponse);
          expect(tokenServiceSpy.savePartialLoginData).toHaveBeenCalledWith(completeLoginResponse);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/initial-login`);
        req.flush({
          success: true,
          message: 'Login successful',
          data: completeLoginResponse
        });
      });

      it('should handle initial login failure', () => {
        const errorMessage = 'Invalid credentials';

        service.initialLogin(mockInitialLoginRequest).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.message).toBe(errorMessage);
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/initial-login`);
        req.flush({
          success: false,
          message: errorMessage
        }, { status: 401, statusText: 'Unauthorized' });

        // Verify auth state shows error
        service.authState$.subscribe(state => {
          expect(state.isAuthenticated).toBe(false);
          expect(state.user).toBe(null);
          expect(state.error).toBe(errorMessage);
          expect(state.isLoading).toBe(false);
        });
      });

      it('should set loading state during initial login', () => {
        let loadingStates: boolean[] = [];

        service.authState$.subscribe(state => {
          loadingStates.push(state.isLoading);
        });

        service.initialLogin(mockInitialLoginRequest).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/initial-login`);
        req.flush({
          success: true,
          message: 'Initial login successful',
          data: mockInitialLoginResponse
        });

        // Should have loading states: false (initial), true (during request), false (after request)
        expect(loadingStates).toContain(true);
        expect(loadingStates[loadingStates.length - 1]).toBe(false);
      });
    });

    describe('selectSeason', () => {
      it('should select existing season successfully', () => {
        const seasonSelectionRequest: SeasonSelectionRequest = {
          season_id: 5
        };

        service.selectSeason(seasonSelectionRequest).subscribe(response => {
          expect(response).toEqual(mockLoginResponse);
          expect(tokenServiceSpy.saveLoginData).toHaveBeenCalledWith(mockLoginResponse);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/select-season`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(seasonSelectionRequest);

        req.flush({
          success: true,
          message: 'Season selected successfully',
          data: mockLoginResponse
        });

        // Verify auth state was updated
        service.authState$.subscribe(state => {
          expect(state.isAuthenticated).toBe(true);
          expect(state.user).toEqual(mockLoginResponse.user);
          expect(state.isLoading).toBe(false);
          expect(state.error).toBe(null);
        });
      });

      it('should create new season successfully', () => {
        const seasonSelectionRequest: SeasonSelectionRequest = {
          create_new_season: true,
          new_season_data: {
            name: 'Nueva Temporada 2026-2027',
            start_date: '2026-12-01',
            end_date: '2027-04-30'
          }
        };

        const responseWithNewSeason: LoginResponse = {
          ...mockLoginResponse,
          season: {
            id: 7,
            name: 'Nueva Temporada 2026-2027',
            start_date: '2026-12-01',
            end_date: '2027-04-30',
            is_active: true,
            is_current: true
          }
        };

        service.selectSeason(seasonSelectionRequest).subscribe(response => {
          expect(response).toEqual(responseWithNewSeason);
          expect(tokenServiceSpy.saveLoginData).toHaveBeenCalledWith(responseWithNewSeason);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/select-season`);
        expect(req.request.body).toEqual(seasonSelectionRequest);

        req.flush({
          success: true,
          message: 'New season created and selected successfully',
          data: responseWithNewSeason
        });
      });

      it('should handle season selection failure', () => {
        const seasonSelectionRequest: SeasonSelectionRequest = {
          season_id: 999 // Invalid season ID
        };
        const errorMessage = 'Invalid season selection';

        service.selectSeason(seasonSelectionRequest).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.message).toBe(errorMessage);
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/select-season`);
        req.flush({
          success: false,
          message: errorMessage
        }, { status: 422, statusText: 'Unprocessable Entity' });

        // Verify auth state shows error but keeps user authenticated (since they had a temp token)
        service.authState$.subscribe(state => {
          expect(state.isLoading).toBe(false);
          expect(state.error).toBe(errorMessage);
        });
      });

      it('should handle validation errors for new season creation', () => {
        const seasonSelectionRequest: SeasonSelectionRequest = {
          create_new_season: true,
          new_season_data: {
            name: '', // Invalid empty name
            start_date: '2026-12-01',
            end_date: '2027-04-30'
          }
        };
        const errorMessage = 'Invalid data provided. Please check your input.';

        service.selectSeason(seasonSelectionRequest).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.message).toBe(errorMessage);
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/select-season`);
        req.flush('Validation failed', { status: 422, statusText: 'Unprocessable Entity' });
      });

      it('should set loading state during season selection', () => {
        let loadingStates: boolean[] = [];

        service.authState$.subscribe(state => {
          loadingStates.push(state.isLoading);
        });

        const seasonSelectionRequest: SeasonSelectionRequest = { season_id: 5 };
        service.selectSeason(seasonSelectionRequest).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/select-season`);
        req.flush({
          success: true,
          message: 'Season selected successfully',
          data: mockLoginResponse
        });

        // Should have loading states: false (initial), true (during request), false (after request)
        expect(loadingStates).toContain(true);
        expect(loadingStates[loadingStates.length - 1]).toBe(false);
      });
    });

    describe('getAvailableSeasons', () => {
      beforeEach(() => {
        tokenServiceSpy.getCurrentSchool.and.returnValue(mockLoginResponse.school);
      });

      it('should fetch available seasons successfully', () => {
        service.getAvailableSeasons().subscribe(seasons => {
          expect(seasons).toEqual(mockAvailableSeasons);
        });

        const expectedUrl = `${environment.apiUrl}/v5/seasons?school_id=${mockLoginResponse.school.id}`;
        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');

        req.flush({
          success: true,
          message: 'Seasons retrieved successfully',
          data: mockAvailableSeasons
        });
      });

      it('should handle error when no school context available', () => {
        tokenServiceSpy.getCurrentSchool.and.returnValue(null);

        service.getAvailableSeasons().subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.message).toBe('No school context available');
          }
        });

        httpMock.expectNone(`${environment.apiUrl}/v5/seasons`);
      });

      it('should handle API error when fetching seasons', () => {
        const errorMessage = 'Failed to fetch seasons';

        service.getAvailableSeasons().subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error).toBeDefined();
          }
        });

        const expectedUrl = `${environment.apiUrl}/v5/seasons?school_id=${mockLoginResponse.school.id}`;
        const req = httpMock.expectOne(expectedUrl);
        req.flush({
          success: false,
          message: errorMessage
        }, { status: 500, statusText: 'Internal Server Error' });
      });

      it('should handle different school contexts', () => {
        const differentSchool = { id: 2, name: 'Different School', slug: 'different-school' };
        tokenServiceSpy.getCurrentSchool.and.returnValue(differentSchool);

        service.getAvailableSeasons().subscribe();

        const expectedUrl = `${environment.apiUrl}/v5/seasons?school_id=${differentSchool.id}`;
        const req = httpMock.expectOne(expectedUrl);

        req.flush({
          success: true,
          data: []
        });
      });
    });
  });

  describe('Season Selection Integration Tests', () => {
    it('should complete full season selection flow', (done) => {
      // Step 1: Initial login
      service.initialLogin(mockInitialLoginRequest).subscribe(initialResponse => {
        expect(initialResponse.requires_season_selection).toBe(true);
        expect(tokenServiceSpy.savePartialLoginData).toHaveBeenCalledWith(initialResponse);

        // Step 2: Select season
        const seasonSelection: SeasonSelectionRequest = { season_id: 5 };
        service.selectSeason(seasonSelection).subscribe(finalResponse => {
          expect(finalResponse).toEqual(mockLoginResponse);
          expect(tokenServiceSpy.saveLoginData).toHaveBeenCalledWith(mockLoginResponse);
          done();
        });

        // Handle season selection request
        const seasonReq = httpMock.expectOne(`${environment.apiUrl}/v5/auth/select-season`);
        seasonReq.flush({
          success: true,
          message: 'Season selected successfully',
          data: mockLoginResponse
        });
      });

      // Handle initial login request
      const initialReq = httpMock.expectOne(`${environment.apiUrl}/v5/auth/initial-login`);
      initialReq.flush({
        success: true,
        message: 'Initial login successful',
        data: mockInitialLoginResponse
      });
    });

    it('should handle mixed authentication states during season selection', () => {
      // Simulate initial login followed by season selection error
      service.initialLogin(mockInitialLoginRequest).subscribe();

      const initialReq = httpMock.expectOne(`${environment.apiUrl}/v5/auth/initial-login`);
      initialReq.flush({
        success: true,
        data: mockInitialLoginResponse
      });

      // Auth should show as authenticated but without full context
      service.authState$.subscribe(state => {
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockInitialLoginResponse.user);
      });

      // Now try season selection that fails
      const seasonSelection: SeasonSelectionRequest = { season_id: 999 };
      service.selectSeason(seasonSelection).subscribe({
        next: () => fail('Should have failed'),
        error: () => {
          // Auth should still show as authenticated but with error
          service.authState$.subscribe(state => {
            expect(state.isAuthenticated).toBe(true); // Still has temp token
            expect(state.error).toBeDefined();
          });
        }
      });

      const seasonReq = httpMock.expectOne(`${environment.apiUrl}/v5/auth/select-season`);
      seasonReq.flush('Invalid season', { status: 422, statusText: 'Unprocessable Entity' });
    });
  });
});