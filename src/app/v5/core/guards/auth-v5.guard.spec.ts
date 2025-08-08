import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

import { AuthV5Guard } from './auth-v5.guard';
import { AuthV5Service } from '../services/auth-v5.service';
import { TokenV5Service } from '../services/token-v5.service';

describe('AuthV5Guard - Login Flow Integration', () => {
  let guard: AuthV5Guard;
  let authService: jasmine.SpyObj<AuthV5Service>;
  let tokenService: jasmine.SpyObj<TokenV5Service>;
  let router: jasmine.SpyObj<Router>;

  const mockRoute: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
  const mockState: RouterStateSnapshot = {
    url: '/v5/dashboard'
  } as RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthV5Service', [
      'isAuthenticated', 
      'getCurrentUser', 
      'getCurrentUserInfo',
      'refreshTokenIfNeeded'
    ]);
    const tokenServiceSpy = jasmine.createSpyObj('TokenV5Service', [
      'hasValidToken',
      'getToken',
      'isTokenExpired',
      'getCurrentUser',
      'getCurrentSchool',
      'getCurrentSeason',
      'clearAll'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthV5Guard,
        { provide: AuthV5Service, useValue: authServiceSpy },
        { provide: TokenV5Service, useValue: tokenServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthV5Guard);
    authService = TestBed.inject(AuthV5Service) as jasmine.SpyObj<AuthV5Service>;
    tokenService = TestBed.inject(TokenV5Service) as jasmine.SpyObj<TokenV5Service>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Single-School User Flow', () => {
    it('should allow access when user has valid token and is authenticated', (done) => {
      // Setup: User has valid token and is authenticated
      tokenService.hasValidToken.and.returnValue(true);
      tokenService.getToken.and.returnValue('valid-token-123');
      tokenService.isTokenExpired.and.returnValue(false);
      tokenService.getCurrentUser.and.returnValue({
        id: 20207,
        email: 'multi@boukii-v5.com',
        name: 'Single School User',
        role: 'member',
        permissions: []
      });
      tokenService.getCurrentSchool.and.returnValue({
        id: 2,
        name: 'ESS Veveyse',
        slug: 'ecole-suisse-de-ski'
      });
      tokenService.getCurrentSeason.and.returnValue({
        id: 10,
        name: 'Temporada 2024-2025',
        start_date: '2024-09-01',
        end_date: '2025-04-30',
        is_active: true
      });

      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentUser.and.returnValue({
        id: 20207,
        email: 'multi@boukii-v5.com'
      } as any);
      authService.refreshTokenIfNeeded.and.returnValue(of(true));

      // Execute
      const result = guard.canActivate(mockRoute, mockState);

      // Verify
      if (result instanceof Subject) {
        result.subscribe(canActivate => {
          expect(canActivate).toBe(true);
          expect(tokenService.hasValidToken).toHaveBeenCalled();
          expect(authService.isAuthenticated).toHaveBeenCalled();
          expect(authService.refreshTokenIfNeeded).toHaveBeenCalled();
          done();
        });
      } else {
        done(result as any);
      }
    });

    it('should handle timing issues when token is being saved', (done) => {
      // Setup: First call no token, second call (after retry) has token
      let hasValidTokenCallCount = 0;
      tokenService.hasValidToken.and.callFake(() => {
        hasValidTokenCallCount++;
        if (hasValidTokenCallCount === 1) {
          return false; // First call - token not yet saved
        } else {
          return true; // Retry call - token now available
        }
      });

      tokenService.getToken.and.returnValue('newly-saved-token-123');
      tokenService.isTokenExpired.and.returnValue(false);
      tokenService.getCurrentUser.and.returnValue({
        id: 20207,
        email: 'multi@boukii-v5.com',
        name: 'Test User',
        role: 'member',
        permissions: []
      });

      authService.isAuthenticated.and.returnValue(true);
      authService.refreshTokenIfNeeded.and.returnValue(of(true));

      // Execute
      const result = guard.canActivate(mockRoute, mockState);

      // Verify timing issue is handled
      if (result instanceof Subject) {
        result.subscribe(canActivate => {
          expect(canActivate).toBe(true);
          expect(tokenService.hasValidToken).toHaveBeenCalledTimes(2); // Initial + retry
          done();
        });
      } else {
        done.fail('Expected observable result for timing issue test');
      }
    });

    it('should redirect to login when no token is found even after retry', (done) => {
      // Setup: No token available even after retry
      tokenService.hasValidToken.and.returnValue(false);
      tokenService.getToken.and.returnValue(null);
      
      const expectedUrlTree = { toString: () => '/v5/auth/login?returnUrl=%2Fv5%2Fdashboard' };
      router.createUrlTree.and.returnValue(expectedUrlTree as any);

      // Execute
      const result = guard.canActivate(mockRoute, mockState);

      // Verify redirect to login
      if (result instanceof Subject) {
        result.subscribe(canActivate => {
          expect(canActivate).toBe(expectedUrlTree);
          expect(router.createUrlTree).toHaveBeenCalledWith(['/v5/auth/login'], {
            queryParams: { returnUrl: '/v5/dashboard' }
          });
          done();
        });
      } else {
        expect(result).toBe(expectedUrlTree);
        done();
      }
    });
  });

  describe('Multi-School User Flow', () => {
    it('should handle multi-school user with complete context', (done) => {
      // Setup: Multi-school user with full context
      tokenService.hasValidToken.and.returnValue(true);
      tokenService.getToken.and.returnValue('multi-school-token-456');
      tokenService.getCurrentUser.and.returnValue({
        id: 20206,
        email: 'admin@boukii-v5.com',
        name: 'Admin User',
        role: 'admin',
        permissions: ['bookings.create', 'clients.manage']
      });
      tokenService.getCurrentSchool.and.returnValue({
        id: 2,
        name: 'ESS Veveyse',
        slug: 'ecole-suisse-de-ski'
      });
      tokenService.getCurrentSeason.and.returnValue({
        id: 10,
        name: 'Temporada 2024-2025',
        start_date: '2024-09-01',
        end_date: '2025-04-30',
        is_active: true
      });

      authService.isAuthenticated.and.returnValue(true);
      authService.refreshTokenIfNeeded.and.returnValue(of(true));

      // Execute
      const result = guard.canActivate(mockRoute, mockState);

      // Verify
      if (result instanceof Subject) {
        result.subscribe(canActivate => {
          expect(canActivate).toBe(true);
          done();
        });
      } else {
        expect(result).toBe(true);
        done();
      }
    });

    it('should load user info when auth service is not initialized', (done) => {
      // Setup: Valid token but auth service not initialized
      tokenService.hasValidToken.and.returnValue(true);
      authService.isAuthenticated.and.returnValue(false); // Not initialized
      authService.getCurrentUser.and.returnValue(null);
      authService.getCurrentUserInfo.and.returnValue(of({
        id: 20206,
        email: 'admin@boukii-v5.com',
        name: 'Admin User'
      } as any));

      // Execute
      const result = guard.canActivate(mockRoute, mockState);

      // Verify user info is loaded
      if (result instanceof Subject) {
        result.subscribe(canActivate => {
          expect(canActivate).toBe(true);
          expect(authService.getCurrentUserInfo).toHaveBeenCalled();
          done();
        });
      } else {
        done.fail('Expected observable result for user info loading');
      }
    });

    it('should handle expired token and redirect to login', (done) => {
      // Setup: Valid token but gets 401 when loading user info
      tokenService.hasValidToken.and.returnValue(true);
      authService.isAuthenticated.and.returnValue(false);
      authService.getCurrentUserInfo.and.returnValue(throwError({ status: 401 }));

      const expectedUrlTree = { toString: () => '/v5/auth/login?returnUrl=%2Fv5%2Fdashboard' };
      router.createUrlTree.and.returnValue(expectedUrlTree as any);

      // Execute
      const result = guard.canActivate(mockRoute, mockState);

      // Verify token is cleared and redirected
      if (result instanceof Subject) {
        result.subscribe(canActivate => {
          expect(canActivate).toBe(expectedUrlTree);
          expect(tokenService.clearAll).toHaveBeenCalled();
          done();
        });
      } else {
        done.fail('Expected observable result for expired token test');
      }
    });
  });

  describe('Token Refresh Scenarios', () => {
    it('should handle token refresh failure gracefully', (done) => {
      // Setup: Valid token, authenticated, but refresh fails
      tokenService.hasValidToken.and.returnValue(true);
      authService.isAuthenticated.and.returnValue(true);
      authService.refreshTokenIfNeeded.and.returnValue(of(false)); // Refresh failed

      const expectedUrlTree = { toString: () => '/v5/auth/login?returnUrl=%2Fv5%2Fdashboard' };
      router.createUrlTree.and.returnValue(expectedUrlTree as any);

      // Execute
      const result = guard.canActivate(mockRoute, mockState);

      // Verify redirect on refresh failure
      if (result instanceof Subject) {
        result.subscribe(canActivate => {
          expect(canActivate).toBe(expectedUrlTree);
          done();
        });
      } else {
        expect(result).toBe(expectedUrlTree);
        done();
      }
    });

    it('should handle token refresh error', (done) => {
      // Setup: Valid token, authenticated, but refresh throws error
      tokenService.hasValidToken.and.returnValue(true);
      authService.isAuthenticated.and.returnValue(true);
      authService.refreshTokenIfNeeded.and.returnValue(throwError(new Error('Network error')));

      const expectedUrlTree = { toString: () => '/v5/auth/login?returnUrl=%2Fv5%2Fdashboard' };
      router.createUrlTree.and.returnValue(expectedUrlTree as any);

      // Execute
      const result = guard.canActivate(mockRoute, mockState);

      // Verify error is handled gracefully
      if (result instanceof Subject) {
        result.subscribe(canActivate => {
          expect(canActivate).toBe(expectedUrlTree);
          done();
        });
      } else {
        done.fail('Expected observable result for refresh error test');
      }
    });
  });

  describe('CanActivateChild', () => {
    it('should delegate to canActivate for child routes', (done) => {
      // Setup
      tokenService.hasValidToken.and.returnValue(true);
      authService.isAuthenticated.and.returnValue(true);
      authService.refreshTokenIfNeeded.and.returnValue(of(true));

      // Execute
      const result = guard.canActivateChild(mockRoute, mockState);

      // Verify same behavior as canActivate
      if (result instanceof Subject) {
        result.subscribe(canActivate => {
          expect(canActivate).toBe(true);
          done();
        });
      } else {
        expect(result).toBe(true);
        done();
      }
    });
  });

  describe('Debug Logging', () => {
    it('should log detailed token state for debugging', () => {
      // Setup with detailed state
      tokenService.hasValidToken.and.returnValue(true);
      tokenService.getToken.and.returnValue('debug-token-789');
      tokenService.isTokenExpired.and.returnValue(false);
      tokenService.getCurrentUser.and.returnValue({
        id: 1,
        email: 'debug@test.com',
        name: 'Debug User',
        role: 'admin',
        permissions: []
      });
      tokenService.getCurrentSchool.and.returnValue({
        id: 2,
        name: 'Debug School',
        slug: 'debug-school'
      });
      tokenService.getCurrentSeason.and.returnValue({
        id: 5,
        name: 'Debug Season',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        is_active: true
      });

      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentUser.and.returnValue({ id: 1, email: 'debug@test.com' } as any);
      authService.refreshTokenIfNeeded.and.returnValue(of(true));

      // Execute
      spyOn(console, 'log');
      guard.canActivate(mockRoute, mockState);

      // Verify detailed logging
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching('AuthV5Guard: Token state debug:')
      );
    });
  });
});