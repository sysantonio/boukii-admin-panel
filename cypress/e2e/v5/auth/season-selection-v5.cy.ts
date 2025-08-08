describe('V5 Season Selection Flow', () => {
  const mockUser = {
    id: 1,
    name: 'Test Admin',
    email: 'admin@escuela-test.com',
    role: 'school_admin',
    permissions: ['manage_courses', 'manage_bookings', 'manage_seasons']
  };

  const mockSchool = {
    id: 2,
    name: 'Escuela Test V5',
    slug: 'escuela-test-v5',
    logo_url: 'https://example.com/logo.jpg',
    timezone: 'Europe/Madrid',
    currency: 'EUR'
  };

  const mockAvailableSeasons = [
    {
      id: 1,
      name: 'Temporada 2024-2025',
      start_date: '2024-09-01',
      end_date: '2025-06-30',
      is_active: true,
      is_current: true,
      is_historical: false
    },
    {
      id: 2,
      name: 'Temporada 2025-2026',
      start_date: '2025-09-01',
      end_date: '2026-06-30',
      is_active: true,
      is_current: false,
      is_historical: false
    },
    {
      id: 3,
      name: 'Temporada 2023-2024',
      start_date: '2023-09-01',
      end_date: '2024-06-30',
      is_active: false,
      is_current: false,
      is_historical: true
    }
  ];

  beforeEach(() => {
    // Clear any existing auth data
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Initial Login Flow - User Without Valid Season', () => {
    beforeEach(() => {
      // Mock initial login response requiring season selection
      cy.intercept('POST', '**/api/v5/auth/initial-login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Initial login successful',
          data: {
            access_token: 'temp-token-12345',
            token_type: 'Bearer',
            expires_at: '2025-01-04T12:00:00Z',
            requires_season_selection: true,
            available_seasons: mockAvailableSeasons,
            user: mockUser,
            school: mockSchool
          }
        }
      }).as('initialLoginRequest');

      // Mock seasons API for dropdown
      cy.intercept('GET', '**/api/v5/seasons?school_id=2', {
        statusCode: 200,
        body: {
          success: true,
          data: mockAvailableSeasons.filter(s => s.is_active)
        }
      }).as('getSeasonsRequest');

      cy.visit('/v5/auth/login');
    });

    it('should redirect to season selection when user has no valid season', () => {
      // Fill login form
      cy.get('[data-cy=email-input]').type('admin@escuela-test.com');
      cy.get('[data-cy=password-input]').type('password123');
      
      // Select school - this should trigger initial login
      cy.get('[data-cy=school-select]').click();
      cy.get('[data-cy=school-option]').contains('Escuela Test V5').click();
      
      // Submit initial login
      cy.get('[data-cy=initial-login-button]').click();
      
      // Verify initial login API call
      cy.wait('@initialLoginRequest').then((interception) => {
        expect(interception.request.body).to.have.property('email', 'admin@escuela-test.com');
        expect(interception.request.body).to.have.property('password', 'password123');
        expect(interception.request.body).to.have.property('school_id', 2);
        expect(interception.request.body).to.not.have.property('season_id');
      });
      
      // Should redirect to season selection page
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/select-season');
    });

    it('should display season selection interface correctly', () => {
      // Perform initial login that requires season selection
      cy.get('[data-cy=email-input]').type('admin@escuela-test.com');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=school-select]').click();
      cy.get('[data-cy=school-option]').contains('Escuela Test V5').click();
      cy.get('[data-cy=initial-login-button]').click();
      
      cy.wait('@initialLoginRequest');
      
      // Verify season selection page elements
      cy.get('[data-cy=season-selection-title]').should('be.visible').and('contain', 'Seleccionar Temporada');
      cy.get('[data-cy=welcome-message]').should('contain', mockUser.name);
      cy.get('[data-cy=school-name]').should('contain', mockSchool.name);
      
      // Verify available seasons are displayed
      cy.get('[data-cy=season-card]').should('have.length', 2); // Only active seasons
      cy.get('[data-cy=season-card]').first().should('contain', 'Temporada 2024-2025');
      cy.get('[data-cy=season-card]').last().should('contain', 'Temporada 2025-2026');
      
      // Verify current season is highlighted
      cy.get('[data-cy=season-card]').first().should('have.class', 'current-season');
      
      // Verify create new season option
      cy.get('[data-cy=create-new-season-button]').should('be.visible');
    });

    it('should display season information correctly', () => {
      // Navigate to season selection
      cy.get('[data-cy=email-input]').type('admin@escuela-test.com');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=school-select]').click();
      cy.get('[data-cy=school-option]').contains('Escuela Test V5').click();
      cy.get('[data-cy=initial-login-button]').click();
      cy.wait('@initialLoginRequest');
      
      // Check season card details
      const seasonCard = cy.get('[data-cy=season-card]').first();
      seasonCard.should('contain', 'Temporada 2024-2025');
      seasonCard.should('contain', '01/09/2024 - 30/06/2025');
      seasonCard.find('[data-cy=season-status]').should('contain', 'Activa');
      seasonCard.find('[data-cy=current-badge]').should('be.visible');
      
      // Check future season
      const futureCard = cy.get('[data-cy=season-card]').last();
      futureCard.should('contain', 'Temporada 2025-2026');
      futureCard.should('contain', '01/09/2025 - 30/06/2026');
      futureCard.find('[data-cy=season-status]').should('contain', 'Próxima');
    });
  });

  describe('Season Selection Process', () => {
    beforeEach(() => {
      // Simulate already completed initial login with temp token
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'temp-token-12345',
          token_type: 'Bearer',
          expires_at: '2025-01-04T12:00:00Z'
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
      });
      
      cy.visit('/v5/auth/select-season');
    });

    it('should successfully select an existing season', () => {
      // Mock successful season selection
      cy.intercept('POST', '**/api/v5/auth/select-season', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Season selected successfully',
          data: {
            access_token: 'final-token-67890',
            token_type: 'Bearer',
            expires_at: '2025-01-04T18:00:00Z',
            user: mockUser,
            school: mockSchool,
            season: mockAvailableSeasons[0]
          }
        }
      }).as('selectSeasonRequest');

      // Select the current season
      cy.get('[data-cy=season-card]').first().click();
      cy.get('[data-cy=confirm-season-button]').click();
      
      // Verify API call
      cy.wait('@selectSeasonRequest').then((interception) => {
        expect(interception.request.body).to.have.property('season_id', 1);
        expect(interception.request.body).to.not.have.property('create_new_season');
      });
      
      // Verify success message and redirection
      cy.get('[data-cy=success-message]').should('be.visible').and('contain', 'Temporada seleccionada');
      cy.url({ timeout: 10000 }).should('include', '/v5/dashboard');
      
      // Verify localStorage has complete data
      cy.window().then((window) => {
        const tokenData = JSON.parse(window.localStorage.getItem('boukii_v5_token'));
        const seasonData = JSON.parse(window.localStorage.getItem('boukii_v5_season'));
        
        expect(tokenData.access_token).to.equal('final-token-67890');
        expect(seasonData.id).to.equal(1);
        expect(seasonData.name).to.equal('Temporada 2024-2025');
      });
    });

    it('should handle season selection with confirmation dialog', () => {
      cy.intercept('POST', '**/api/v5/auth/select-season', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            access_token: 'final-token-67890',
            token_type: 'Bearer',
            expires_at: '2025-01-04T18:00:00Z',
            user: mockUser,
            school: mockSchool,
            season: mockAvailableSeasons[1]
          }
        }
      }).as('selectSeasonRequest');

      // Select future season
      cy.get('[data-cy=season-card]').last().click();
      
      // Verify selection highlights
      cy.get('[data-cy=season-card]').last().should('have.class', 'selected');
      
      // Verify season details in confirmation
      cy.get('[data-cy=selected-season-name]').should('contain', 'Temporada 2025-2026');
      cy.get('[data-cy=selected-season-dates]').should('contain', '01/09/2025 - 30/06/2026');
      
      // Confirm selection
      cy.get('[data-cy=confirm-season-button]').should('be.enabled').click();
      
      cy.wait('@selectSeasonRequest');
      cy.url({ timeout: 10000 }).should('include', '/v5/dashboard');
    });

    it('should allow changing season selection before confirmation', () => {
      // Select first season
      cy.get('[data-cy=season-card]').first().click();
      cy.get('[data-cy=season-card]').first().should('have.class', 'selected');
      
      // Change to second season
      cy.get('[data-cy=season-card]').last().click();
      cy.get('[data-cy=season-card]').first().should('not.have.class', 'selected');
      cy.get('[data-cy=season-card]').last().should('have.class', 'selected');
      
      // Verify confirmation shows new selection
      cy.get('[data-cy=selected-season-name]').should('contain', 'Temporada 2025-2026');
    });

    it('should handle season selection errors gracefully', () => {
      cy.intercept('POST', '**/api/v5/auth/select-season', {
        statusCode: 422,
        body: {
          success: false,
          message: 'Season is not available for selection',
          error_code: 'SEASON_NOT_AVAILABLE'
        }
      }).as('selectSeasonError');

      cy.get('[data-cy=season-card]').first().click();
      cy.get('[data-cy=confirm-season-button]').click();
      
      cy.wait('@selectSeasonError');
      
      // Verify error message
      cy.get('[data-cy=error-message]').should('be.visible').and('contain', 'Season is not available');
      
      // Should remain on season selection page
      cy.url().should('include', '/v5/auth/select-season');
      
      // User should be able to try again
      cy.get('[data-cy=season-card]').should('be.visible');
      cy.get('[data-cy=confirm-season-button]').should('be.enabled');
    });
  });

  describe('Create New Season Flow', () => {
    beforeEach(() => {
      // Simulate already completed initial login
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'temp-token-12345',
          token_type: 'Bearer',
          expires_at: '2025-01-04T12:00:00Z'
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
      });
      
      cy.visit('/v5/auth/select-season');
    });

    it('should display new season creation form', () => {
      cy.get('[data-cy=create-new-season-button]').click();
      
      // Verify form elements
      cy.get('[data-cy=new-season-form]').should('be.visible');
      cy.get('[data-cy=season-name-input]').should('be.visible');
      cy.get('[data-cy=start-date-input]').should('be.visible');
      cy.get('[data-cy=end-date-input]').should('be.visible');
      cy.get('[data-cy=create-season-button]').should('be.visible');
      cy.get('[data-cy=cancel-create-button]').should('be.visible');
      
      // Should hide existing seasons list
      cy.get('[data-cy=season-card]').should('not.be.visible');
    });

    it('should validate new season form input', () => {
      cy.get('[data-cy=create-new-season-button]').click();
      
      // Try to submit empty form
      cy.get('[data-cy=create-season-button]').click();
      
      // Verify validation errors
      cy.get('[data-cy=name-error]').should('be.visible').and('contain', 'obligatorio');
      cy.get('[data-cy=start-date-error]').should('be.visible').and('contain', 'obligatorio');
      cy.get('[data-cy=end-date-error]').should('be.visible').and('contain', 'obligatorio');
      
      // Fill invalid data
      cy.get('[data-cy=season-name-input]').type('T'); // Too short
      cy.get('[data-cy=start-date-input]').type('2025-12-01');
      cy.get('[data-cy=end-date-input]').type('2025-06-01'); // End before start
      
      cy.get('[data-cy=create-season-button]').click();
      
      // Verify specific validation messages
      cy.get('[data-cy=name-error]').should('contain', 'mínimo 3 caracteres');
      cy.get('[data-cy=end-date-error]').should('contain', 'posterior a la fecha de inicio');
    });

    it('should successfully create a new season', () => {
      const newSeasonData = {
        id: 4,
        name: 'Temporada 2026-2027',
        start_date: '2026-09-01',
        end_date: '2027-06-30',
        is_active: true,
        is_current: true
      };

      cy.intercept('POST', '**/api/v5/auth/select-season', {
        statusCode: 200,
        body: {
          success: true,
          message: 'New season created and selected successfully',
          data: {
            access_token: 'final-token-new-season',
            token_type: 'Bearer',
            expires_at: '2025-01-04T18:00:00Z',
            user: mockUser,
            school: mockSchool,
            season: newSeasonData
          }
        }
      }).as('createSeasonRequest');

      cy.get('[data-cy=create-new-season-button]').click();
      
      // Fill form with valid data
      cy.get('[data-cy=season-name-input]').type('Temporada 2026-2027');
      cy.get('[data-cy=start-date-input]').type('2026-09-01');
      cy.get('[data-cy=end-date-input]').type('2027-06-30');
      
      // Submit form
      cy.get('[data-cy=create-season-button]').click();
      
      // Verify API call
      cy.wait('@createSeasonRequest').then((interception) => {
        expect(interception.request.body).to.have.property('create_new_season', true);
        expect(interception.request.body.new_season_data).to.deep.include({
          name: 'Temporada 2026-2027',
          start_date: '2026-09-01',
          end_date: '2027-06-30'
        });
      });
      
      // Verify success and redirection
      cy.get('[data-cy=success-message]').should('be.visible').and('contain', 'Temporada creada');
      cy.url({ timeout: 10000 }).should('include', '/v5/dashboard');
      
      // Verify localStorage has new season data
      cy.window().then((window) => {
        const seasonData = JSON.parse(window.localStorage.getItem('boukii_v5_season'));
        expect(seasonData.name).to.equal('Temporada 2026-2027');
        expect(seasonData.id).to.equal(4);
      });
    });

    it('should cancel new season creation', () => {
      cy.get('[data-cy=create-new-season-button]').click();
      
      // Fill some data
      cy.get('[data-cy=season-name-input]').type('Test Season');
      
      // Cancel
      cy.get('[data-cy=cancel-create-button]').click();
      
      // Should return to season selection
      cy.get('[data-cy=new-season-form]').should('not.be.visible');
      cy.get('[data-cy=season-card]').should('be.visible');
      cy.get('[data-cy=create-new-season-button]').should('be.visible');
    });

    it('should handle new season creation errors', () => {
      cy.intercept('POST', '**/api/v5/auth/select-season', {
        statusCode: 422,
        body: {
          success: false,
          message: 'Season name already exists for this school',
          error_code: 'DUPLICATE_SEASON_NAME'
        }
      }).as('createSeasonError');

      cy.get('[data-cy=create-new-season-button]').click();
      cy.get('[data-cy=season-name-input]').type('Temporada 2024-2025'); // Duplicate name
      cy.get('[data-cy=start-date-input]').type('2026-09-01');
      cy.get('[data-cy=end-date-input]').type('2027-06-30');
      cy.get('[data-cy=create-season-button]').click();
      
      cy.wait('@createSeasonError');
      
      // Verify error message and form remains visible
      cy.get('[data-cy=error-message]').should('be.visible').and('contain', 'Season name already exists');
      cy.get('[data-cy=new-season-form]').should('be.visible');
      
      // User should be able to correct and try again
      cy.get('[data-cy=season-name-input]').clear().type('Temporada 2026-2027');
      cy.get('[data-cy=create-season-button]').should('be.enabled');
    });
  });

  describe('Loading States and User Experience', () => {
    beforeEach(() => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'temp-token-12345',
          token_type: 'Bearer',
          expires_at: '2025-01-04T12:00:00Z'
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
      });
      
      cy.visit('/v5/auth/select-season');
    });

    it('should show loading state during season selection', () => {
      cy.intercept('POST', '**/api/v5/auth/select-season', {
        statusCode: 200,
        body: { success: true, data: {} },
        delay: 1000 // Add delay to test loading state
      }).as('selectSeasonSlow');

      cy.get('[data-cy=season-card]').first().click();
      cy.get('[data-cy=confirm-season-button]').click();
      
      // Verify loading state
      cy.get('[data-cy=confirm-season-button]').should('be.disabled');
      cy.get('[data-cy=confirm-season-button]').should('contain', 'Seleccionando...');
      cy.get('[data-cy=loading-spinner]').should('be.visible');
      
      // Verify button returns to normal after request
      cy.wait('@selectSeasonSlow');
      cy.get('[data-cy=confirm-season-button]', { timeout: 2000 }).should('not.be.disabled');
    });

    it('should show loading state during new season creation', () => {
      cy.intercept('POST', '**/api/v5/auth/select-season', {
        statusCode: 200,
        body: { success: true, data: {} },
        delay: 1500
      }).as('createSeasonSlow');

      cy.get('[data-cy=create-new-season-button]').click();
      cy.get('[data-cy=season-name-input]').type('Test Season');
      cy.get('[data-cy=start-date-input]').type('2026-09-01');
      cy.get('[data-cy=end-date-input]').type('2027-06-30');
      cy.get('[data-cy=create-season-button]').click();
      
      // Verify loading state
      cy.get('[data-cy=create-season-button]').should('be.disabled');
      cy.get('[data-cy=create-season-button]').should('contain', 'Creando...');
      cy.get('[data-cy=cancel-create-button]').should('be.disabled');
      
      cy.wait('@createSeasonSlow');
    });

    it('should display proper user and school context information', () => {
      // Verify user context
      cy.get('[data-cy=user-avatar]').should('be.visible');
      cy.get('[data-cy=user-name]').should('contain', mockUser.name);
      cy.get('[data-cy=user-email]').should('contain', mockUser.email);
      cy.get('[data-cy=user-role]').should('contain', 'Administrador de Escuela');
      
      // Verify school context
      cy.get('[data-cy=school-logo]').should('be.visible');
      cy.get('[data-cy=school-name]').should('contain', mockSchool.name);
      cy.get('[data-cy=school-timezone]').should('contain', 'Europe/Madrid');
    });
  });

  describe('Authentication and Security', () => {
    it('should redirect to login if no temp token exists', () => {
      // Visit season selection without temp token
      cy.visit('/v5/auth/select-season');
      
      // Should redirect to login
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/login');
      cy.get('[data-cy=error-message]').should('contain', 'sesión expirada');
    });

    it('should redirect to login if temp token is expired', () => {
      // Set expired token
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'expired-token',
          token_type: 'Bearer',
          expires_at: '2024-01-01T12:00:00Z' // Expired
        }));
      });
      
      cy.visit('/v5/auth/select-season');
      cy.url({ timeout: 5000 }).should('include', '/v5/auth/login');
    });

    it('should include proper authorization headers in API calls', () => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'temp-token-12345',
          token_type: 'Bearer',
          expires_at: '2025-01-04T12:00:00Z'
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
      });

      cy.intercept('POST', '**/api/v5/auth/select-season', (req) => {
        expect(req.headers).to.have.property('authorization', 'Bearer temp-token-12345');
        expect(req.headers).to.have.property('x-school-id', '2');
        
        req.reply({
          statusCode: 200,
          body: { success: true, data: {} }
        });
      }).as('selectSeasonWithHeaders');

      cy.visit('/v5/auth/select-season');
      cy.get('[data-cy=season-card]').first().click();
      cy.get('[data-cy=confirm-season-button]').click();
      
      cy.wait('@selectSeasonWithHeaders');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    beforeEach(() => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'temp-token-12345',
          token_type: 'Bearer',
          expires_at: '2025-01-04T12:00:00Z'
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
      });
    });

    it('should handle network errors during season selection', () => {
      cy.intercept('POST', '**/api/v5/auth/select-season', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/v5/auth/select-season');
      cy.get('[data-cy=season-card]').first().click();
      cy.get('[data-cy=confirm-season-button]').click();
      
      cy.wait('@networkError');
      
      // Should display network error message
      cy.get('[data-cy=error-message]').should('be.visible');
      cy.get('[data-cy=retry-button]').should('be.visible').click();
      
      // Should retry the request
      cy.wait('@networkError');
    });

    it('should handle server errors gracefully', () => {
      cy.intercept('POST', '**/api/v5/auth/select-season', {
        statusCode: 500,
        body: { success: false, message: 'Internal server error' }
      }).as('serverError');
      
      cy.visit('/v5/auth/select-season');
      cy.get('[data-cy=season-card]').first().click();
      cy.get('[data-cy=confirm-season-button]').click();
      
      cy.wait('@serverError');
      
      // Should display generic error message
      cy.get('[data-cy=error-message]').should('be.visible').and('contain', 'Error del servidor');
      
      // Should allow user to try again
      cy.get('[data-cy=season-card]').should('be.visible');
      cy.get('[data-cy=confirm-season-button]').should('be.enabled');
    });

    it('should handle empty seasons list', () => {
      // Mock empty seasons response
      cy.intercept('GET', '**/api/v5/seasons?school_id=2', {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('emptySeasonsRequest');
      
      cy.visit('/v5/auth/select-season');
      
      // Should show empty state
      cy.get('[data-cy=no-seasons-message]').should('be.visible').and('contain', 'No hay temporadas disponibles');
      cy.get('[data-cy=create-new-season-button]').should('be.visible');
      cy.get('[data-cy=contact-support-button]').should('be.visible');
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_token', JSON.stringify({
          access_token: 'temp-token-12345',
          token_type: 'Bearer',
          expires_at: '2025-01-04T12:00:00Z'
        }));
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockUser));
        window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
      });
      
      cy.visit('/v5/auth/select-season');
    });

    it('should support keyboard navigation for season selection', () => {
      // Tab through season cards
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'season-card');
      
      // Select with Enter key
      cy.focused().type('{enter}');
      cy.focused().should('have.class', 'selected');
      
      // Tab to confirm button
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'confirm-season-button');
    });

    it('should have proper ARIA attributes', () => {
      cy.get('[data-cy=season-card]').should('have.attr', 'role', 'button');
      cy.get('[data-cy=season-card]').should('have.attr', 'tabindex', '0');
      cy.get('[data-cy=season-card]').should('have.attr', 'aria-label');
      
      cy.get('[data-cy=confirm-season-button]').should('have.attr', 'aria-disabled', 'true');
      
      // Select a season and verify aria-disabled changes
      cy.get('[data-cy=season-card]').first().click();
      cy.get('[data-cy=confirm-season-button]').should('have.attr', 'aria-disabled', 'false');
    });

    it('should announce screen reader messages', () => {
      cy.get('[data-cy=season-card]').first().click();
      
      // Should have live region for announcements
      cy.get('[data-cy=sr-announcements]').should('contain', 'Temporada seleccionada');
    });
  });
});