describe('V5 Season Flow - Complete Integration', () => {
  beforeEach(() => {
    // Clear any existing auth data
    cy.clearLocalStorage();
    cy.clearCookies();

    // Mock the V5 auth endpoints
    cy.intercept('POST', '**/api/v5/auth/check-user', (req) => {
      if (req.body.email === 'admin@season-test.com') {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            message: 'User verified successfully',
            data: {
              user: {
                id: 20208,
                name: 'Season Test Admin',
                email: 'admin@season-test.com',
                email_verified_at: null
              },
              schools: [{
                id: 3,
                name: 'Season Test School',
                slug: 'season-test-school',
                logo: 'https://api.boukii.com/storage/logos/test-school.png',
                user_role: 'admin',
                can_administer: true
              }],
              requires_school_selection: false,
              temp_token: 'temp-token-season-test-123'
            }
          }
        });
      }
    }).as('checkUser');

    // Mock school selection endpoint - no season provided initially
    cy.intercept('POST', '**/api/v5/auth/select-school', {
      statusCode: 200,
      body: {
        success: true,
        message: 'School selected, season selection needed',
        data: {
          user: {
            id: 20208,
            name: 'Season Test Admin',
            email: 'admin@season-test.com',
            email_verified_at: null
          },
          school: {
            id: 3,
            name: 'Season Test School',
            slug: 'season-test-school',
            logo: 'https://api.boukii.com/storage/logos/test-school.png'
          },
          // ✅ No season provided - this should trigger automatic season selection
          access_token: 'school-selected-token-789',
          token_type: 'Bearer',
          expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
        }
      }
    }).as('selectSchool');

    // Mock seasons endpoints for automatic selection
    cy.intercept('GET', '**/api/v5/seasons/current', (req) => {
      // No active season found
      req.reply({
        statusCode: 404,
        body: {
          success: false,
          message: 'No active season found for this school',
          error_code: 'NO_ACTIVE_SEASON'
        }
      });
    }).as('getCurrentSeason');

    cy.intercept('GET', '**/api/v5/seasons', (req) => {
      // Return available seasons for selection
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: 'Available seasons retrieved',
          data: [
            {
              id: 15,
              name: 'Temporada 2024-2025',
              start_date: '2024-09-01',
              end_date: '2025-04-30',
              is_active: false,
              is_current: false,
              is_closed: false,
              is_historical: false
            },
            {
              id: 16,
              name: 'Temporada 2023-2024',
              start_date: '2023-09-01',
              end_date: '2024-04-30',
              is_active: false,
              is_current: false,
              is_closed: true,
              is_historical: true
            }
          ]
        }
      });
    }).as('getSeasons');

    // Mock season creation endpoint
    cy.intercept('POST', '**/api/v5/seasons', (req) => {
      const newSeason = {
        id: 17,
        name: req.body.name || 'New Season',
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        is_active: true,
        is_current: true,
        is_closed: false,
        is_historical: false,
        school_id: 3
      };

      req.reply({
        statusCode: 201,
        body: {
          success: true,
          message: 'Season created successfully',
          data: newSeason
        }
      });
    }).as('createSeason');

    // Mock season selection endpoint
    cy.intercept('POST', '**/api/v5/auth/select-season', (req) => {
      const seasonId = req.body.season_id;
      
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: 'Season selected successfully',
          data: {
            user: {
              id: 20208,
              name: 'Season Test Admin',
              email: 'admin@season-test.com',
              email_verified_at: null
            },
            school: {
              id: 3,
              name: 'Season Test School',
              slug: 'season-test-school',
              logo: 'https://api.boukii.com/storage/logos/test-school.png'
            },
            season: {
              id: seasonId,
              name: 'Selected Season',
              start_date: '2024-09-01',
              end_date: '2025-04-30',
              is_active: true,
              is_current: true
            },
            access_token: 'season-selected-token-456',
            token_type: 'Bearer',
            expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
          }
        }
      });
    }).as('selectSeason');

    // Mock dashboard endpoints
    cy.intercept('GET', '**/api/v5/dashboard/**', {
      statusCode: 200,
      body: {
        success: true,
        data: { stats: {}, activities: [], alerts: [] }
      }
    }).as('dashboardData');
  });

  describe('Case A: School with Active Season (Auto-Selection)', () => {
    it('should automatically select active season and redirect to dashboard', () => {
      // Override the getCurrentSeason mock to return an active season
      cy.intercept('GET', '**/api/v5/seasons/current', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Current season found',
          data: {
            id: 18,
            name: 'Active Season 2024-2025',
            start_date: '2024-09-01',
            end_date: '2025-04-30',
            is_active: true,
            is_current: true,
            is_closed: false,
            is_historical: false
          }
        }
      }).as('getCurrentSeasonActive');

      cy.visit('/v5/auth/login');

      // Fill and submit login form
      cy.get('[data-cy=login-email]').should('be.visible').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      // Wait for authentication flow
      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeasonActive');

      // Should automatically redirect to dashboard with active season
      cy.url({ timeout: 15000 }).should('include', '/v5');
      cy.contains('¡Bienvenido de vuelta').should('be.visible');

      // Verify season context is saved
      cy.window().then((win) => {
        const seasonData = win.localStorage.getItem('boukii_v5_season');
        expect(seasonData).to.not.be.null;
        
        const parsedSeason = JSON.parse(seasonData);
        expect(parsedSeason).to.have.property('name', 'Active Season 2024-2025');
        expect(parsedSeason).to.have.property('is_active', true);
      });
    });
  });

  describe('Case B: School without Active Season (Manual Selection)', () => {
    it('should show available seasons and allow manual selection', () => {
      cy.visit('/v5/auth/login');

      // Complete login flow
      cy.get('[data-cy=login-email]').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeason'); // No active season
      cy.wait('@getSeasons'); // Get available seasons

      // Should show season selector with available seasons
      cy.contains('Seleccionar Temporada').should('be.visible');
      cy.contains('Temporada 2024-2025').should('be.visible');
      cy.contains('Temporada 2023-2024').should('be.visible');

      // Select a season
      cy.contains('Temporada 2024-2025').parents('.season-card').find('button').click();

      // Wait for season selection
      cy.wait('@selectSeason');

      // Should navigate to dashboard
      cy.url({ timeout: 10000 }).should('include', '/v5');
      cy.contains('¡Bienvenido de vuelta').should('be.visible');
    });

    it('should handle empty seasons list gracefully', () => {
      // Override to return empty seasons
      cy.intercept('GET', '**/api/v5/seasons', {
        statusCode: 200,
        body: {
          success: true,
          message: 'No seasons found',
          data: []
        }
      }).as('getEmptySeasons');

      cy.visit('/v5/auth/login');

      cy.get('[data-cy=login-email]').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeason');
      cy.wait('@getEmptySeasons');

      // Should show option to create new season
      cy.contains('No hay temporadas disponibles').should('be.visible');
      cy.contains('Crear Nueva Temporada').should('be.visible');
    });
  });

  describe('Case C: Creating New Season with Permissions', () => {
    it('should allow admin user to create new season', () => {
      cy.visit('/v5/auth/login');

      // Complete login flow to season selector
      cy.get('[data-cy=login-email]').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeason');
      cy.wait('@getSeasons');

      // Navigate to create season form
      cy.contains('Crear Nueva Temporada').click();

      // Fill season creation form
      cy.get('[data-cy=season-name]').type('Nueva Temporada 2025-2026');
      cy.get('[data-cy=season-start-date]').type('2025-09-01');
      cy.get('[data-cy=season-end-date]').type('2026-04-30');

      // Submit new season
      cy.get('[data-cy=create-season-submit]').click();

      // Wait for season creation and selection
      cy.wait('@createSeason');
      cy.wait('@selectSeason');

      // Should navigate to dashboard with new season
      cy.url({ timeout: 10000 }).should('include', '/v5');
      cy.contains('¡Bienvenido de vuelta').should('be.visible');

      // Verify new season is saved
      cy.window().then((win) => {
        const seasonData = win.localStorage.getItem('boukii_v5_season');
        expect(seasonData).to.not.be.null;
        
        const parsedSeason = JSON.parse(seasonData);
        expect(parsedSeason).to.have.property('name').that.includes('Nueva Temporada');
      });
    });

    it('should validate season creation form', () => {
      cy.visit('/v5/auth/login');

      // Get to season selector
      cy.get('[data-cy=login-email]').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeason');
      cy.wait('@getSeasons');

      // Open create form
      cy.contains('Crear Nueva Temporada').click();

      // Try to submit without filling required fields
      cy.get('[data-cy=create-season-submit]').click();

      // Should show validation errors
      cy.contains('El nombre es requerido').should('be.visible');
      cy.contains('La fecha de inicio es requerida').should('be.visible');
      cy.contains('La fecha de fin es requerida').should('be.visible');

      // Fill invalid dates
      cy.get('[data-cy=season-name]').type('Test Season');
      cy.get('[data-cy=season-start-date]').type('2025-12-01');
      cy.get('[data-cy=season-end-date]').type('2025-01-01'); // End before start

      cy.get('[data-cy=create-season-submit]').click();

      // Should show date validation error
      cy.contains('La fecha de fin debe ser posterior a la fecha de inicio').should('be.visible');
    });
  });

  describe('Case D: Insufficient Permissions (403 Error)', () => {
    it('should handle 403 errors when user lacks permissions', () => {
      // Mock 403 error for season creation
      cy.intercept('POST', '**/api/v5/seasons', {
        statusCode: 403,
        body: {
          success: false,
          message: 'Insufficient permissions to create seasons',
          error_code: 'PERMISSION_DENIED'
        }
      }).as('createSeasonForbidden');

      cy.visit('/v5/auth/login');

      // Get to season creation
      cy.get('[data-cy=login-email]').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeason');
      cy.wait('@getSeasons');

      cy.contains('Crear Nueva Temporada').click();

      // Fill and submit form
      cy.get('[data-cy=season-name]').type('Unauthorized Season');
      cy.get('[data-cy=season-start-date]').type('2025-09-01');
      cy.get('[data-cy=season-end-date]').type('2026-04-30');
      cy.get('[data-cy=create-season-submit]').click();

      cy.wait('@createSeasonForbidden');

      // Should show permission error
      cy.contains('No tienes permisos para crear temporadas').should('be.visible');
      
      // Should remain on season selector
      cy.contains('Seleccionar Temporada').should('be.visible');
    });
  });

  describe('Context Header Validation', () => {
    it('should send correct X-School-ID and X-Season-ID headers', () => {
      cy.visit('/v5/auth/login');

      // Complete auth flow
      cy.get('[data-cy=login-email]').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeason');
      cy.wait('@getSeasons');

      // Verify that seasons request includes correct headers
      cy.get('@getSeasons').then((interception) => {
        expect(interception.request.headers).to.have.property('x-school-id');
        expect(interception.request.headers['x-school-id']).to.equal('3');
      });

      // Select a season
      cy.contains('Temporada 2024-2025').parents('.season-card').find('button').click();
      cy.wait('@selectSeason');

      // Navigate to a protected route to verify season header
      cy.visit('/v5/courses');

      // Mock courses endpoint to verify headers
      cy.intercept('GET', '**/api/v5/courses', (req) => {
        // Verify both school and season headers are present
        expect(req.headers).to.have.property('x-school-id', '3');
        expect(req.headers).to.have.property('x-season-id');
        
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            data: []
          }
        });
      }).as('getCourses');

      cy.wait('@getCourses');
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should handle network errors during season operations', () => {
      // Mock network error
      cy.intercept('GET', '**/api/v5/seasons', { forceNetworkError: true }).as('seasonsNetworkError');

      cy.visit('/v5/auth/login');

      cy.get('[data-cy=login-email]').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeason');

      // Should show network error message
      cy.contains('Error de conexión al cargar las temporadas').should('be.visible');
      cy.contains('Reintentar').should('be.visible').click();

      // Should retry the request
      cy.wait('@seasonsNetworkError');
    });

    it('should handle season context loss and recovery', () => {
      cy.visit('/v5/auth/login');

      // Complete full auth flow
      cy.get('[data-cy=login-email]').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeason');
      cy.wait('@getSeasons');

      cy.contains('Temporada 2024-2025').parents('.season-card').find('button').click();
      cy.wait('@selectSeason');

      // Artificially clear season context
      cy.window().then((win) => {
        win.localStorage.removeItem('boukii_v5_season');
      });

      // Navigate to a protected route
      cy.visit('/v5/courses');

      // Should redirect back to season selector due to missing season context
      cy.url().should('include', '/v5/season-selector');
      cy.contains('Seleccionar Temporada').should('be.visible');
    });
  });

  describe('Multi-Season Management', () => {
    it('should handle switching between seasons', () => {
      // Complete initial season selection
      cy.visit('/v5/auth/login');
      cy.get('[data-cy=login-email]').type('admin@season-test.com');
      cy.get('[data-cy=login-password]').type('password123');
      cy.get('[data-cy=login-submit]').click();

      cy.wait('@checkUser');
      cy.wait('@selectSchool');
      cy.wait('@getCurrentSeason');
      cy.wait('@getSeasons');

      cy.contains('Temporada 2024-2025').parents('.season-card').find('button').click();
      cy.wait('@selectSeason');

      // Navigate to dashboard
      cy.url().should('include', '/v5');

      // Open season selector from dashboard
      cy.get('[data-cy=season-selector-button]').click();

      // Should show current season and option to change
      cy.contains('Selected Season').should('be.visible');
      cy.contains('Cambiar Temporada').should('be.visible').click();

      // Should show season list again
      cy.contains('Temporada 2023-2024').parents('.season-card').find('button').click();
      cy.wait('@selectSeason');

      // Should update season context and remain on dashboard
      cy.url().should('include', '/v5');
    });
  });
});