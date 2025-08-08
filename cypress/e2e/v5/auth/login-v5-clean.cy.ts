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