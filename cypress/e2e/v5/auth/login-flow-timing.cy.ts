describe('V5 Login Flow - Timing and Guard Integration', () => {
  beforeEach(() => {
    // Clear any existing auth data
    cy.clearLocalStorage();
    cy.clearCookies();

    // Intercept the check-user API call
    cy.intercept('POST', '**/api/v5/auth/check-user', (req) => {
      if (req.body.email === 'multi@boukii-v5.com') {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            message: 'Credenciales verificadas correctamente',
            data: {
              user: {
                id: 20207,
                name: 'Single School User',
                email: 'multi@boukii-v5.com',
                email_verified_at: null
              },
              schools: [{
                id: 2,
                name: 'ESS Veveyse',
                slug: 'ecole-suisse-de-ski',
                logo: 'https://api.boukii.com/storage/logos/ess-les-paccots.png',
                user_role: 'member',
                can_administer: false
              }],
              requires_school_selection: false,
              temp_token: 'temp-token-single-school-123'
            }
          }
        });
      } else if (req.body.email === 'admin@boukii-v5.com') {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            message: 'Credenciales verificadas correctamente',
            data: {
              user: {
                id: 20206,
                name: 'Multi School Admin',
                email: 'admin@boukii-v5.com',
                email_verified_at: null
              },
              schools: [
                {
                  id: 2,
                  name: 'ESS Veveyse',
                  slug: 'ecole-suisse-de-ski',
                  logo: 'https://api.boukii.com/storage/logos/ess-les-paccots.png',
                  user_role: 'member',
                  can_administer: false
                },
                {
                  id: 1,
                  name: 'School Testing',
                  slug: 'SchoolTesting',
                  logo: 'https://api.boukii.com/storage/logos/ess-les-paccots.png',
                  user_role: 'member',
                  can_administer: false
                }
              ],
              requires_school_selection: true,
              temp_token: 'temp-token-multi-school-456'
            }
          }
        });
      }
    }).as('checkUser');

    // Intercept the select-school API call
    cy.intercept('POST', '**/api/v5/auth/select-school', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Login completado exitosamente',
        data: {
          user: {
            id: 20207,
            name: 'Single School User',
            email: 'multi@boukii-v5.com',
            email_verified_at: null
          },
          school: {
            id: 2,
            name: 'ESS Veveyse',
            slug: 'ecole-suisse-de-ski',
            logo: 'https://api.boukii.com/storage/logos/ess-les-paccots.png'
          },
          season: {
            id: 10,
            name: 'Temporada 2024-2025',
            start_date: '2024-09-01T00:00:00.000000Z',
            end_date: '2025-08-31T00:00:00.000000Z',
            is_active: true
          },
          access_token: 'final-access-token-789',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours from now
        }
      }
    }).as('selectSchool');

    // Mock dashboard data to avoid timing issues
    cy.intercept('GET', '**/api/v5/dashboard/**', {
      statusCode: 200,
      body: {
        success: true,
        data: {}
      }
    }).as('dashboardData');
  });

  describe('Single-School User Flow (No School Selection Required)', () => {
    it('should handle single-school login with proper timing', () => {
      cy.visit('/v5/auth/login');

      // Fill and submit login form
      cy.get('[data-cy=login-email]').should('be.visible').type('multi@boukii-v5.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      // Wait for check-user call
      cy.wait('@checkUser');

      // Wait for automatic school selection
      cy.wait('@selectSchool');

      // Verify success message
      cy.contains('Login exitoso').should('be.visible');

      // Wait for navigation to complete (timing issue fix)
      cy.url({ timeout: 10000 }).should('include', '/v5');

      // Verify localStorage has correct token data
      cy.window().then((win) => {
        const tokenData = win.localStorage.getItem('boukii_v5_token');
        expect(tokenData).to.not.be.null;
        
        const parsedToken = JSON.parse(tokenData);
        expect(parsedToken).to.have.property('access_token', 'final-access-token-789');
        expect(parsedToken).to.have.property('token_type', 'Bearer');

        const userData = win.localStorage.getItem('boukii_v5_user');
        expect(userData).to.not.be.null;
        
        const parsedUser = JSON.parse(userData);
        expect(parsedUser).to.have.property('email', 'multi@boukii-v5.com');

        const schoolData = win.localStorage.getItem('boukii_v5_school');
        expect(schoolData).to.not.be.null;
        
        const parsedSchool = JSON.parse(schoolData);
        expect(parsedSchool).to.have.property('id', 2);
        expect(parsedSchool).to.have.property('name', 'ESS Veveyse');

        const seasonData = win.localStorage.getItem('boukii_v5_season');
        expect(seasonData).to.not.be.null;
        
        const parsedSeason = JSON.parse(seasonData);
        expect(parsedSeason).to.have.property('id', 10);
        expect(parsedSeason).to.have.property('name', 'Temporada 2024-2025');
      });

      // Dashboard should load without guard issues
      cy.contains('¡Bienvenido de vuelta').should('be.visible');
    });

    it('should persist authentication across page refreshes', () => {
      // First complete login
      cy.visit('/v5/auth/login');
      cy.get('[data-cy=login-email]').type('multi@boukii-v5.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();
      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.url().should('include', '/v5');

      // Refresh page
      cy.reload();

      // Should still be authenticated and on dashboard
      cy.url().should('include', '/v5');
      cy.contains('¡Bienvenido de vuelta').should('be.visible');

      // Verify token is still valid
      cy.window().then((win) => {
        const tokenData = JSON.parse(win.localStorage.getItem('boukii_v5_token'));
        expect(tokenData.access_token).to.eq('final-access-token-789');
      });
    });

    it('should handle navigation directly to protected route', () => {
      // Set up authentication state manually (simulating already logged in user)
      cy.window().then((win) => {
        const tokenData = {
          access_token: 'existing-token-123',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
        };
        const userData = {
          id: 20207,
          name: 'Test User',
          email: 'multi@boukii-v5.com',
          role: 'member',
          permissions: []
        };
        const schoolData = {
          id: 2,
          name: 'ESS Veveyse',
          slug: 'ecole-suisse-de-ski'
        };
        const seasonData = {
          id: 10,
          name: 'Temporada 2024-2025',
          start_date: '2024-09-01T00:00:00.000000Z',
          end_date: '2025-08-31T00:00:00.000000Z',
          is_active: true
        };

        win.localStorage.setItem('boukii_v5_token', JSON.stringify(tokenData));
        win.localStorage.setItem('boukii_v5_user', JSON.stringify(userData));
        win.localStorage.setItem('boukii_v5_school', JSON.stringify(schoolData));
        win.localStorage.setItem('boukii_v5_season', JSON.stringify(seasonData));
      });

      // Navigate directly to dashboard
      cy.visit('/v5/dashboard');

      // Should allow access without redirecting to login
      cy.url().should('include', '/v5/dashboard');
      cy.contains('¡Bienvenido de vuelta').should('be.visible');
    });
  });

  describe('Multi-School User Flow (School Selection Required)', () => {
    it('should handle multi-school login with school selection timing', () => {
      cy.visit('/v5/auth/login');

      // Fill and submit login form
      cy.get('[data-cy=login-email]').type('admin@boukii-v5.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      // Wait for check-user call
      cy.wait('@checkUser');

      // Should navigate to school selector
      cy.url().should('include', '/v5/auth/school-selector');
      cy.contains('Seleccionar Escuela').should('be.visible');

      // Select a school
      cy.contains('ESS Veveyse').parents('.school-card').find('button').click();

      // Wait for school selection
      cy.wait('@selectSchool');

      // Should navigate to dashboard with proper timing
      cy.url({ timeout: 10000 }).should('include', '/v5');
      cy.contains('¡Bienvenido de vuelta').should('be.visible');
    });

    it('should handle school selection cancellation', () => {
      cy.visit('/v5/auth/login');

      cy.get('[data-cy=login-email]').type('admin@boukii-v5.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();
      cy.wait('@checkUser');

      // Navigate to school selector
      cy.url().should('include', '/v5/auth/school-selector');

      // Cancel selection
      cy.contains('Cancelar').click();

      // Should return to login
      cy.url().should('include', '/v5/auth/login');
    });
  });

  describe('AuthV5Guard Timing Issues', () => {
    it('should handle rapid navigation after login', () => {
      cy.visit('/v5/auth/login');
      
      cy.get('[data-cy=login-email]').type('multi@boukii-v5.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();
      cy.wait('@checkUser');
      cy.wait('@selectSchool');

      // Rapid navigation to different protected routes
      cy.visit('/v5/courses');
      cy.url().should('include', '/v5/courses');

      cy.visit('/v5/bookings');  
      cy.url().should('include', '/v5/bookings');

      cy.visit('/v5/dashboard');
      cy.url().should('include', '/v5/dashboard');
      
      // Should not redirect to login for any of these
      cy.url().should('not.include', '/v5/auth/login');
    });

    it('should handle concurrent guard executions', () => {
      // Setup authentication state
      cy.window().then((win) => {
        const tokenData = {
          access_token: 'concurrent-test-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        };
        const userData = {
          id: 20207,
          email: 'concurrent@test.com',
          name: 'Concurrent User',
          role: 'member',
          permissions: []
        };
        const schoolData = { id: 2, name: 'ESS Veveyse', slug: 'ecole-suisse-de-ski' };
        const seasonData = { id: 10, name: 'Test Season', start_date: '2024-01-01', end_date: '2024-12-31', is_active: true };

        win.localStorage.setItem('boukii_v5_token', JSON.stringify(tokenData));
        win.localStorage.setItem('boukii_v5_user', JSON.stringify(userData));
        win.localStorage.setItem('boukii_v5_school', JSON.stringify(schoolData));
        win.localStorage.setItem('boukii_v5_season', JSON.stringify(seasonData));
      });

      // Open multiple tabs/routes simultaneously
      cy.visit('/v5/dashboard');
      cy.window().then((win) => {
        win.open('/v5/courses', '_blank');
        win.open('/v5/bookings', '_blank');
      });

      // Main tab should still work
      cy.url().should('include', '/v5/dashboard');
      cy.contains('¡Bienvenido de vuelta').should('be.visible');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors during login gracefully', () => {
      // Override intercept to return network error
      cy.intercept('POST', '**/api/v5/auth/check-user', { forceNetworkError: true }).as('networkError');

      cy.visit('/v5/auth/login');
      cy.get('[data-cy=login-email]').type('error@test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      // Should show error message
      cy.contains('Error de login').should('be.visible');
      
      // Should stay on login page
      cy.url().should('include', '/v5/auth/login');
    });

    it('should handle invalid credentials', () => {
      cy.intercept('POST', '**/api/v5/auth/check-user', {
        statusCode: 422,
        body: {
          success: false,
          message: 'Credenciales incorrectas'
        }
      }).as('invalidCredentials');

      cy.visit('/v5/auth/login');
      cy.get('[data-cy=login-email]').type('invalid@user.com');
      cy.get('[data-cy=login-password]').type('wrongpassword');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@invalidCredentials');

      // Should show error message
      cy.contains('Credenciales incorrectas').should('be.visible');
      cy.url().should('include', '/v5/auth/login');
    });

    it('should handle token expiration during navigation', () => {
      // Setup with expired token
      cy.window().then((win) => {
        const expiredTokenData = {
          access_token: 'expired-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() - 60000).toISOString() // 1 minute ago
        };
        win.localStorage.setItem('boukii_v5_token', JSON.stringify(expiredTokenData));
      });

      // Try to access protected route
      cy.visit('/v5/dashboard');

      // Should redirect to login
      cy.url().should('include', '/v5/auth/login');
      cy.url().should('include', 'returnUrl=%2Fv5%2Fdashboard');
    });
  });
});