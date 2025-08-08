describe('V5 Authentication Flow - Unified Login System', () => {
  beforeEach(() => {
    // Clear any existing authentication state
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();
    
    // Visit the login page
    cy.visit('/v5/auth/login');
  });

  describe('Single School Login Flow', () => {
    it('should auto-complete login for single school user', () => {
      // Mock API responses for single school user
      cy.intercept('POST', '**/api/v5/auth/check-user', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            user: {
              id: 1,
              name: 'Single School User',
              email: 'single@boukii.com',
              email_verified_at: '2024-01-01T00:00:00.000Z'
            },
            schools: [
              {
                id: 1,
                name: 'Test School',
                slug: 'test-school',
                logo: 'test.png',
                user_role: 'admin',
                can_administer: true
              }
            ],
            requires_school_selection: false,
            temp_token: 'temp-token-single-123'
          },
          message: 'Credenciales verificadas correctamente'
        }
      }).as('checkUserSingle');

      cy.intercept('POST', '**/api/v5/auth/select-school', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            user: {
              id: 1,
              name: 'Single School User',
              email: 'single@boukii.com',
              email_verified_at: '2024-01-01T00:00:00.000Z'
            },
            school: {
              id: 1,
              name: 'Test School',
              slug: 'test-school',
              logo: 'test.png'
            },
            season: {
              id: 1,
              name: 'Season 2024-25',
              year: '2024-25',
              is_current: true,
              start_date: '2024-09-01',
              end_date: '2025-08-31'
            },
            access_token: 'full-access-token-789',
            token_type: 'Bearer',
            expires_at: null,
            has_multiple_seasons: false,
            available_seasons: []
          },
          message: 'Login completado exitosamente'
        }
      }).as('selectSchool');

      // Fill login form (using pre-filled values for dev)
      cy.get('input[formControlName="email"]').clear().type('single@boukii.com');
      cy.get('input[formControlName="password"]').clear().type('password123');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Wait for API calls
      cy.wait('@checkUserSingle');
      cy.wait('@selectSchool');

      // Should show success message
      cy.contains('Login exitoso');

      // Should navigate to dashboard
      cy.url().should('include', '/v5');
    });

  });

  describe('Multi School Login Flow', () => {
    it('should redirect to school selector for multi-school user', () => {
      // Mock API response for multi-school user
      cy.intercept('POST', '**/api/v5/auth/check-user', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            user: {
              id: 2,
              name: 'Multi School User',
              email: 'multi@boukii.com',
              email_verified_at: '2024-01-01T00:00:00.000Z'
            },
            schools: [
              {
                id: 1,
                name: 'School One',
                slug: 'school-one',
                logo: 'school1.png',
                user_role: 'admin',
                can_administer: true
              },
              {
                id: 2,
                name: 'School Two',
                slug: 'school-two',
                logo: 'school2.png',
                user_role: 'teacher',
                can_administer: false
              }
            ],
            requires_school_selection: true,
            temp_token: 'temp-token-multi-456'
          },
          message: 'Credenciales verificadas correctamente'
        }
      }).as('checkUserMulti');

      // Fill and submit form
      cy.get('input[formControlName="email"]').clear().type('multi@boukii.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@checkUserMulti');

      // Should show success message
      cy.contains('Credenciales verificadas. Por favor selecciona tu escuela.');

      // Should navigate to school selector
      cy.url().should('include', '/v5/auth/school-selector');
    });

  });

  describe('Error Handling', () => {
    it('should handle invalid credentials', () => {
      cy.intercept('POST', '**/api/v5/auth/check-user', {
        statusCode: 422,
        body: {
          success: false,
          message: 'Credenciales incorrectas',
          errors: {
            email: ['Credenciales incorrectas.']
          }
        }
      }).as('checkUserFail');

      cy.get('input[formControlName="email"]').clear().type('wrong@example.com');
      cy.get('input[formControlName="password"]').clear().type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@checkUserFail');

      // Should show error message
      cy.contains('Error de login');

      // Should remain on login page
      cy.url().should('include', '/v5/auth/login');
    });

    it('should handle user without schools', () => {
      cy.intercept('POST', '**/api/v5/auth/check-user', {
        statusCode: 403,
        body: {
          success: false,
          message: 'Usuario sin escuelas asignadas.',
          data: null
        }
      }).as('checkUserNoSchools');

      cy.get('input[formControlName="email"]').clear().type('noschools@boukii.com');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@checkUserNoSchools');

      cy.contains('Error de login');
      cy.url().should('include', '/v5/auth/login');
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      cy.get('input[formControlName="email"]').clear().type('invalid-email');
      cy.get('input[formControlName="password"]').clear().type('password123');
      cy.get('button[type="submit"]').click();

      // Email field should be invalid
      cy.get('input[formControlName="email"]').should('have.class', 'ng-invalid');

      // Should remain on login page
      cy.url().should('include', '/v5/auth/login');
    });

    it('should validate password minimum length', () => {
      cy.get('input[formControlName="email"]').clear().type('test@boukii.com');
      cy.get('input[formControlName="password"]').clear().type('123');
      cy.get('button[type="submit"]').click();

      // Password field should be invalid
      cy.get('input[formControlName="password"]').should('have.class', 'ng-invalid');

      // Should remain on login page
      cy.url().should('include', '/v5/auth/login');
    });
  });
});
      cy.get('[data-cy=login-button]').click();
      
      cy.get('[data-cy=email-error]').should('be.visible').and('contain', 'obligatorio');
      cy.get('[data-cy=password-error]').should('be.visible').and('contain', 'obligatorio');
      cy.get('[data-cy=school-error]').should('be.visible').and('contain', 'escuela');
      cy.get('[data-cy=season-error]').should('be.visible').and('contain', 'temporada');
    });

    it('should validate email format', () => {
      cy.get('[data-cy=email-input]').type('invalid-email');
      cy.get('[data-cy=password-input]').click(); // Trigger validation
      
      cy.get('[data-cy=email-error]').should('be.visible').and('contain', 'válida');
    });

    it('should validate minimum password length', () => {
      cy.get('[data-cy=password-input]').type('123');
      cy.get('[data-cy=email-input]').click(); // Trigger validation
      
      cy.get('[data-cy=password-error]').should('be.visible').and('contain', 'Mínimo 6');
    });

    it('should disable login button when form is invalid', () => {
      cy.get('[data-cy=login-button]').should('be.disabled');
      
      // Fill partial form
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=login-button]').should('be.disabled');
      
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=login-button]').should('be.disabled');
    });
  });

  describe('Login Success Flow', () => {
    it('should successfully login with valid credentials', () => {
      // Mock successful API response
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Login successful',
          data: {
            access_token: 'mock-token-12345',
            token_type: 'Bearer',
            expires_at: '2025-01-04T12:00:00Z',
            user: {
              id: 1,
              name: 'Test User',
              email: 'admin@escuela.com',
              role: 'school_admin',
              permissions: ['manage_courses', 'manage_bookings']
            },
            school: {
              id: 1,
              name: 'Test School',
              slug: 'test-school'
            },
            season: {
              id: 5,
              name: 'Season 2024-2025',
              is_active: true,
              is_current: true
            }
          }
        }
      }).as('loginRequest');

      // Fill form with valid data
      cy.get('[data-cy=email-input]').type('admin@escuela.com');
      cy.get('[data-cy=password-input]').type('password123');
      
      cy.get('[data-cy=school-select]').click();
      cy.get('[data-cy=school-option]').first().click();
      
      cy.get('[data-cy=season-select]').click();
      cy.get('[data-cy=season-option]').first().click();
      
      // Submit form
      cy.get('[data-cy=login-button]').should('not.be.disabled').click();
      
      // Verify API call
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.request.body).to.have.property('email', 'admin@escuela.com');
        expect(interception.request.body).to.have.property('password', 'password123');
        expect(interception.request.body).to.have.property('school_id');
        expect(interception.request.body).to.have.property('season_id');
      });
      
      // Verify success message and redirection
      cy.get('[data-cy=success-message]').should('be.visible').and('contain', 'exitoso');
      cy.url({ timeout: 10000 }).should('include', '/v5/dashboard');
    });

    it('should save login data to localStorage', () => {
      // Mock successful login
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            access_token: 'mock-token-12345',
            token_type: 'Bearer',
            expires_at: '2025-01-04T12:00:00Z',
            user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'school_admin', permissions: [] },
            school: { id: 1, name: 'Test School', slug: 'test-school' },
            season: { id: 5, name: 'Season 2024-2025', is_active: true }
          }
        }
      });

      // Perform login
      cy.get('[data-cy=test-data-button]').click(); // Fill test data
      cy.get('[data-cy=login-button]').click();

      // Verify localStorage contains auth data
      cy.window().then((window) => {
        const tokenData = window.localStorage.getItem('boukii_v5_token');
        const userData = window.localStorage.getItem('boukii_v5_user');
        const schoolData = window.localStorage.getItem('boukii_v5_school');
        const seasonData = window.localStorage.getItem('boukii_v5_season');

        expect(tokenData).to.not.be.null;
        expect(userData).to.not.be.null;
        expect(schoolData).to.not.be.null;
        expect(seasonData).to.not.be.null;

        const parsedToken = JSON.parse(tokenData);
        expect(parsedToken.access_token).to.equal('mock-token-12345');
      });
    });

    it('should handle remember me option', () => {
      cy.intercept('POST', '**/api/v5/auth/login', { statusCode: 200, body: { success: true, data: {} } });

      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=remember-checkbox]').check();
      cy.get('[data-cy=login-button]').click();

      cy.wait('@loginRequest').then((interception) => {
        expect(interception.request.body).to.have.property('remember_me', true);
      });
    });
  });

  describe('Login Error Handling', () => {
    it('should display error message for invalid credentials', () => {
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          message: 'Invalid credentials',
          error_code: 'INVALID_CREDENTIALS'
        }
      }).as('loginError');

      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=login-button]').click();

      cy.wait('@loginError');
      cy.get('[data-cy=error-message]').should('be.visible').and('contain', 'Invalid credentials');
    });

    it('should display error for inactive school', () => {
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 403,
        body: {
          success: false,
          message: 'School not found or inactive',
          error_code: 'SCHOOL_NOT_FOUND'
        }
      });

      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=login-button]').click();

      cy.get('[data-cy=error-message]').should('be.visible').and('contain', 'School not found');
    });

    it('should display error for invalid season', () => {
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 403,
        body: {
          success: false,
          message: 'Season not found or not associated with school',
          error_code: 'SEASON_NOT_FOUND'
        }
      });

      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=login-button]').click();

      cy.get('[data-cy=error-message]').should('be.visible').and('contain', 'Season not found');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '**/api/v5/auth/login', { forceNetworkError: true });

      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=login-button]').click();

      cy.get('[data-cy=error-message]').should('be.visible');
    });

    it('should clear password field after failed login', () => {
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 401,
        body: { success: false, message: 'Invalid credentials' }
      });

      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=login-button]').click();

      cy.get('[data-cy=password-input]').should('have.value', '');
      cy.get('[data-cy=remember-checkbox]').should('not.be.checked');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during login', () => {
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 200,
        body: { success: true, data: {} },
        delay: 1000 // Add delay to test loading state
      });

      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=login-button]').click();

      // Verify loading state
      cy.get('[data-cy=login-button]').should('be.disabled');
      cy.get('[data-cy=login-button]').should('contain', 'Iniciando sesión');
      
      // After request completes
      cy.get('[data-cy=login-button]', { timeout: 5000 }).should('not.be.disabled');
    });

    it('should show loading spinner for schools', () => {
      // This test depends on the component's loading simulation
      cy.get('[data-cy=school-select]').should('be.visible');
      // Schools should load automatically, but we can verify the select works
    });
  });

  describe('Navigation and Auth Guard', () => {
    it('should redirect authenticated users to dashboard', () => {
      // Simulate existing auth data
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'existing-token',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify({
          id: 1,
          name: 'Existing User',
          email: 'existing@example.com',
          role: 'school_admin',
          permissions: []
        }));
      });

      cy.visit('/v5/auth/login');
      cy.url({ timeout: 5000 }).should('include', '/v5/dashboard');
    });

    it('should redirect to returnUrl after login', () => {
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            access_token: 'token',
            user: { id: 1, name: 'User', email: 'test@example.com', role: 'school_admin', permissions: [] },
            school: { id: 1, name: 'School', slug: 'school' },
            season: { id: 1, name: 'Season', is_active: true }
          }
        }
      });

      // Visit login with returnUrl
      cy.visit('/v5/auth/login?returnUrl=%2Fv5%2Fcourses');

      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=login-button]').click();

      // Should redirect to courses page after login
      cy.url({ timeout: 10000 }).should('include', '/v5/courses');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-cy=email-input]').should('have.attr', 'autocomplete', 'username');
      cy.get('[data-cy=password-input]').should('have.attr', 'autocomplete', 'current-password');
      cy.get('[data-cy=toggle-password]').should('have.attr', 'aria-label');
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-cy=email-input]').focus().type('test@example.com');
      cy.get('[data-cy=email-input]').tab();
      cy.focused().should('have.attr', 'data-cy', 'password-input');
    });
  });

  describe('Development Features', () => {
    it('should show test data button in development mode', () => {
      // This depends on the isDevMode() function in the component
      cy.get('[data-cy=test-data-button]').should('be.visible');
    });

    it('should fill form with test data when test button is clicked', () => {
      cy.get('[data-cy=test-data-button]').click();

      cy.get('[data-cy=email-input]').should('have.value', 'admin@escuela.com');
      cy.get('[data-cy=password-input]').should('have.value', 'password123');
      // School and season should also be selected
    });
  });
});