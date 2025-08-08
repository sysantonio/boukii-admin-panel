describe('V5 Route Protection and Guards', () => {
  const mockAuthenticatedUser = {
    id: 1,
    name: 'Test Admin',
    email: 'admin@escuela.com',
    role: 'school_admin',
    permissions: ['manage_courses', 'manage_bookings', 'manage_clients', 'view_analytics']
  };

  const mockSchool = {
    id: 1,
    name: 'Test School',
    slug: 'test-school',
    timezone: 'Europe/Madrid'
  };

  const mockSeason = {
    id: 1,
    name: 'Season 2024-2025',
    is_active: true,
    is_current: true
  };

  const mockRestrictedUser = {
    id: 2,
    name: 'Monitor User',
    email: 'monitor@escuela.com',
    role: 'monitor',
    permissions: ['view_courses', 'manage_own_bookings'] // Limited permissions
  };

  beforeEach(() => {
    // Clear storage
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('AuthV5Guard Protection', () => {
    it('should redirect unauthenticated users to login', () => {
      // Attempt to access protected route without authentication
      cy.visit('/v5/dashboard');
      
      // Should be redirected to login
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/login');
      cy.get('[data-cy=error-message]').should('be.visible').and('contain', 'Inicia sesión');
    });

    it('should redirect users with expired tokens to login', () => {
      // Set expired token
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'expired-token',
          token_type: 'Bearer',
          expires_at: '2024-01-01T12:00:00Z' // Expired
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
      });

      cy.visit('/v5/dashboard');
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/login');
    });

    it('should allow access with valid authentication', () => {
      // Set valid authentication data
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'valid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
        window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
      });

      // Mock dashboard API response
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 200,
        body: { success: true, data: { bookings: { total: 0 }, clients: { total: 0 } } }
      });

      cy.visit('/v5/dashboard');
      cy.url().should('include', '/v5/dashboard');
      cy.get('[data-cy=dashboard-container]').should('be.visible');
    });

    it('should preserve returnUrl after login redirect', () => {
      const targetRoute = '/v5/courses';
      
      // Attempt to access protected route
      cy.visit(targetRoute);
      
      // Should redirect to login with returnUrl
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/login');
      cy.url().should('include', `returnUrl=${encodeURIComponent(targetRoute)}`);
      
      // Perform login
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'valid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
        window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
      });

      // Mock login success
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 200,
        body: { success: true, data: { access_token: 'new-token', user: mockAuthenticatedUser } }
      });

      // Complete login and verify redirect to original target
      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=login-button]').click();

      cy.url({ timeout: 10000 }).should('include', targetRoute);
    });
  });

  describe('SeasonContextGuard Protection', () => {
    beforeEach(() => {
      // Set valid authentication but no season context
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'valid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
        // Deliberately omit season data
      });
    });

    it('should redirect to season selection when no season context exists', () => {
      cy.visit('/v5/bookings'); // Level 4 protected route
      
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/select-season');
      cy.get('[data-cy=error-message]').should('contain', 'temporada');
    });

    it('should allow access to level 4 routes with valid season context', () => {
      // Add season context
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
      });

      // Mock API responses
      cy.intercept('GET', '**/api/v5/bookings*', {
        statusCode: 200,
        body: { success: true, data: [] }
      });

      cy.visit('/v5/bookings');
      cy.url().should('include', '/v5/bookings');
    });

    it('should redirect when season context is invalid', () => {
      // Set invalid/expired season
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_season', JSON.stringify({
          id: 999,
          name: 'Invalid Season',
          is_active: false,
          is_current: false
        }));
      });

      cy.visit('/v5/courses');
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/select-season');
    });
  });

  describe('Permission-Based Route Protection', () => {
    beforeEach(() => {
      // Set up authenticated user with limited permissions
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'valid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
        window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
      });
    });

    it('should allow access for users with sufficient permissions', () => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
      });

      // Mock API response
      cy.intercept('GET', '**/api/v5/analytics*', {
        statusCode: 200,
        body: { success: true, data: {} }
      });

      cy.visit('/v5/analytics');
      cy.url().should('include', '/v5/analytics');
    });

    it('should deny access for users without required permissions', () => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockRestrictedUser));
      });

      cy.visit('/v5/analytics');
      
      // Should redirect to insufficient permissions page
      cy.url({ timeout: 5000 }).should('include', '/v5/insufficient-permissions');
      cy.get('[data-cy=insufficient-permissions-message]').should('be.visible');
    });

    it('should show appropriate error messages for permission denied', () => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockRestrictedUser));
      });

      cy.visit('/v5/analytics');
      cy.url({ timeout: 5000 }).should('include', '/v5/insufficient-permissions');
      
      cy.get('[data-cy=required-permission]').should('contain', 'view_analytics');
      cy.get('[data-cy=user-role]').should('contain', 'monitor');
      cy.get('[data-cy=contact-admin-button]').should('be.visible');
    });

    it('should provide navigation back to dashboard from insufficient permissions', () => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockRestrictedUser));
      });

      cy.visit('/v5/analytics');
      cy.url({ timeout: 5000 }).should('include', '/v5/insufficient-permissions');
      
      // Mock dashboard API
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 200,
        body: { success: true, data: { bookings: { total: 0 } } }
      });

      cy.get('[data-cy=back-to-dashboard-button]').click();
      cy.url({ timeout: 5000 }).should('include', '/v5/dashboard');
    });
  });

  describe('Route Hierarchy and Navigation', () => {
    beforeEach(() => {
      // Set up fully authenticated user
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'valid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
        window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
      });
    });

    it('should protect all V5 routes under main guard', () => {
      const protectedRoutes = [
        '/v5/dashboard',
        '/v5/bookings',
        '/v5/courses',
        '/v5/clients',
        '/v5/analytics',
        '/v5/monitors'
      ];

      protectedRoutes.forEach(route => {
        // Mock appropriate API responses
        cy.intercept('GET', `**/api/v5${route.replace('/v5', '')}*`, {
          statusCode: 200,
          body: { success: true, data: [] }
        });

        cy.visit(route);
        cy.url().should('include', route);
      });
    });

    it('should correctly handle nested route protection', () => {
      // Test nested routes like /v5/bookings/123
      cy.intercept('GET', '**/api/v5/bookings/123', {
        statusCode: 200,
        body: { success: true, data: { id: 123, client_name: 'Test Client' } }
      });

      cy.visit('/v5/bookings/123');
      cy.url().should('include', '/v5/bookings/123');
    });

    it('should handle route parameters correctly', () => {
      // Test parameterized routes
      cy.intercept('GET', '**/api/v5/courses/456', {
        statusCode: 200,
        body: { success: true, data: { id: 456, name: 'Test Course' } }
      });

      cy.visit('/v5/courses/456');
      cy.url().should('include', '/v5/courses/456');
    });
  });

  describe('Guard Interaction and Edge Cases', () => {
    it('should handle simultaneous guard failures gracefully', () => {
      // User with no authentication, no season, and no permissions
      cy.visit('/v5/analytics');
      
      // Should redirect to login first (AuthV5Guard takes precedence)
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/login');
    });

    it('should handle guard reentrancy properly', () => {
      // Set partial authentication
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'valid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
        // No season context
      });

      cy.visit('/v5/bookings');
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/select-season');

      // Complete season selection
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
      });

      // Mock API response
      cy.intercept('GET', '**/api/v5/bookings*', {
        statusCode: 200,
        body: { success: true, data: [] }
      });

      // Navigate back to original route
      cy.visit('/v5/bookings');
      cy.url().should('include', '/v5/bookings');
    });

    it('should handle browser back/forward navigation with guards', () => {
      // Set up authentication
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'valid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
        window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
      });

      // Mock API responses
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 200,
        body: { success: true, data: { bookings: { total: 0 } } }
      });

      cy.intercept('GET', '**/api/v5/courses*', {
        statusCode: 200,
        body: { success: true, data: [] }
      });

      // Navigate through routes
      cy.visit('/v5/dashboard');
      cy.url().should('include', '/v5/dashboard');

      cy.visit('/v5/courses');
      cy.url().should('include', '/v5/courses');

      // Use browser back
      cy.go('back');
      cy.url().should('include', '/v5/dashboard');

      // Use browser forward
      cy.go('forward');
      cy.url().should('include', '/v5/courses');
    });

    it('should handle concurrent route access attempts', () => {
      // This test verifies that multiple rapid navigation attempts don't cause race conditions
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'valid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
        window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
      });

      // Mock API responses with slight delays
      cy.intercept('GET', '**/api/v5/bookings*', {
        statusCode: 200,
        body: { success: true, data: [] },
        delay: 100
      });

      cy.intercept('GET', '**/api/v5/courses*', {
        statusCode: 200,
        body: { success: true, data: [] },
        delay: 150
      });

      // Rapidly attempt to access different routes
      cy.visit('/v5/bookings');
      cy.visit('/v5/courses');
      
      // Final URL should be the last one requested
      cy.url({ timeout: 5000 }).should('include', '/v5/courses');
    });
  });

  describe('API Token Validation', () => {
    it('should handle API 401 responses and redirect to login', () => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'invalid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
        window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
      });

      // Mock 401 response
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 401,
        body: { success: false, message: 'Unauthorized' }
      });

      cy.visit('/v5/dashboard');
      
      // Should redirect to login after API call fails
      cy.url({ timeout: 10000 }).should('include', '/v5/auth/login');
      cy.get('[data-cy=error-message]').should('contain', 'expirada');
    });

    it('should clear localStorage on authentication failure', () => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'invalid-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockAuthenticatedUser));
      });

      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 401,
        body: { success: false, message: 'Token expired' }
      });

      cy.visit('/v5/dashboard');
      cy.url({ timeout: 10000 }).should('include', '/v5/auth/login');

      // Verify localStorage is cleared
      cy.window().then((window) => {
        expect(window.localStorage.getItem('boukii_v5_token')).to.be.null;
        expect(window.localStorage.getItem('boukii_v5_user')).to.be.null;
        expect(window.localStorage.getItem('boukii_v5_school')).to.be.null;
        expect(window.localStorage.getItem('boukii_v5_season')).to.be.null;
      });
    });
  });
});