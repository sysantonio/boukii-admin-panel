describe('V5 Season Creation - School Context Integration', () => {
  beforeEach(() => {
    // Set up API route intercepts for season creation
    cy.intercept('GET', '**/api/v5/auth/me', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            id: 20206,
            name: 'Admin User',
            email: 'admin@boukii-v5.com',
            role: 'admin'
          },
          school: {
            id: 2,
            name: 'ESS Veveyse',
            slug: 'ecole-suisse-de-ski'
          }
        }
      }
    }).as('getCurrentUser');

    // Intercept season creation request
    cy.intercept('POST', '**/api/v5/seasons', (req) => {
      // Verify school context is included in the request
      expect(req.headers).to.have.property('x-school-id', '2');
      expect(req.body).to.have.property('school_id', 2);
      
      cy.wrap(req.body).should('deep.include', {
        school_id: 2,
        name: 'Temporada 2024-2025',
        start_date: '2024-09-01',
        end_date: '2025-04-30'
      });

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: 'Season created successfully',
          data: {
            id: 10,
            name: req.body.name,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            school_id: 2,
            is_active: true,
            is_current: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      });
    }).as('createSeason');

    // Intercept season selection after creation
    cy.intercept('POST', '**/api/v5/auth/select-season', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Season selected successfully',
        data: {
          user: {
            id: 20206,
            name: 'Admin User',
            email: 'admin@boukii-v5.com'
          },
          school: {
            id: 2,
            name: 'ESS Veveyse'
          },
          season: {
            id: 10,
            name: 'Temporada 2024-2025',
            start_date: '2024-09-01T00:00:00.000000Z',
            end_date: '2025-04-30T00:00:00.000000Z',
            is_active: true
          },
          access_token: 'mock-final-token-123',
          token_type: 'Bearer'
        }
      }
    }).as('selectNewSeason');

    // Mock empty seasons list to trigger create season modal
    cy.intercept('GET', '**/api/v5/seasons*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'No seasons found',
        data: []
      }
    }).as('getSeasons');

    // Login as development user
    cy.loginAsV5User('admin@boukii-v5.com', 'password123');
  });

  it('should create a new season with correct school context when no seasons exist', () => {
    // Visit dashboard which should show season selector
    cy.visit('/v5');

    // Wait for seasons API call and verify empty response
    cy.wait('@getSeasons');

    // Season selector modal should be visible
    cy.get('[data-cy=season-selector-modal]', { timeout: 10000 })
      .should('be.visible');

    // No seasons available message should be shown
    cy.contains('No hay temporadas disponibles').should('be.visible');

    // Click on "Create new season" button
    cy.get('[data-cy=create-season-button]')
      .should('be.visible')
      .click();

    // Season creation form should appear
    cy.get('[data-cy=season-creation-form]')
      .should('be.visible');

    // Fill in season details
    cy.get('[data-cy=season-name-input]')
      .clear()
      .type('Temporada 2024-2025');

    cy.get('[data-cy=season-start-date-input]')
      .clear()
      .type('2024-09-01');

    cy.get('[data-cy=season-end-date-input]')
      .clear()
      .type('2025-04-30');

    // Submit the form
    cy.get('[data-cy=create-season-submit]')
      .should('not.be.disabled')
      .click();

    // Wait for season creation API call
    cy.wait('@createSeason').then((interception) => {
      // Verify the request included school context
      expect(interception.request.headers).to.have.property('x-school-id', '2');
      expect(interception.request.body).to.deep.include({
        school_id: 2,
        name: 'Temporada 2024-2025',
        start_date: '2024-09-01',
        end_date: '2025-04-30'
      });
    });

    // Wait for automatic season selection
    cy.wait('@selectNewSeason');

    // Success message should appear
    cy.contains('Temporada "Temporada 2024-2025" creada y seleccionada correctamente')
      .should('be.visible');

    // Season selector modal should disappear
    cy.get('[data-cy=season-selector-modal]')
      .should('not.exist');

    // Dashboard should now load with the new season
    cy.url().should('include', '/v5');
    cy.contains('¡Bienvenido de vuelta, Admin User!').should('be.visible');
  });

  it('should handle season creation errors gracefully', () => {
    // Override the season creation intercept to return an error
    cy.intercept('POST', '**/api/v5/seasons', {
      statusCode: 400,
      body: {
        success: false,
        message: 'School context is required',
        errors: {
          school_id: ['The school_id field is required.']
        }
      }
    }).as('createSeasonError');

    cy.visit('/v5');
    cy.wait('@getSeasons');

    // Open season creation form
    cy.get('[data-cy=season-selector-modal]').should('be.visible');
    cy.get('[data-cy=create-season-button]').click();

    // Fill and submit form
    cy.get('[data-cy=season-name-input]').type('Test Season');
    cy.get('[data-cy=season-start-date-input]').type('2024-01-01');
    cy.get('[data-cy=season-end-date-input]').type('2024-12-31');
    cy.get('[data-cy=create-season-submit]').click();

    // Wait for error response
    cy.wait('@createSeasonError');

    // Error message should appear
    cy.contains('School context is required').should('be.visible');
    
    // Form should still be visible (not closed)
    cy.get('[data-cy=season-creation-form]').should('be.visible');
    
    // User can try again
    cy.get('[data-cy=create-season-submit]').should('not.be.disabled');
  });

  it('should include school context in all API requests during season creation flow', () => {
    // Track all API requests to verify they include school context
    const apiRequests: any[] = [];
    
    cy.intercept('**', (req) => {
      if (req.url.includes('/api/v5/')) {
        apiRequests.push({
          url: req.url,
          method: req.method,
          headers: req.headers,
          body: req.body
        });
      }
      req.continue();
    }).as('allApiRequests');

    cy.visit('/v5');
    
    // Complete season creation flow
    cy.get('[data-cy=create-season-button]').click();
    cy.get('[data-cy=season-name-input]').type('Context Test Season');
    cy.get('[data-cy=season-start-date-input]').type('2024-01-01');
    cy.get('[data-cy=season-end-date-input]').type('2024-12-31');
    cy.get('[data-cy=create-season-submit]').click();

    cy.wait('@createSeason');

    // Verify all relevant API requests included school context
    cy.then(() => {
      const relevantRequests = apiRequests.filter(req => 
        req.url.includes('/seasons') && req.method === 'POST'
      );

      expect(relevantRequests).to.have.length.greaterThan(0);
      
      relevantRequests.forEach(req => {
        // Check headers for school context
        expect(req.headers).to.have.property('x-school-id', '2');
        
        // For POST requests, check body as well
        if (req.method === 'POST' && req.body) {
          expect(req.body).to.have.property('school_id', 2);
        }
      });
    });
  });

  it('should maintain school context throughout the entire user session', () => {
    cy.visit('/v5');

    // Create season
    cy.get('[data-cy=create-season-button]').click();
    cy.get('[data-cy=season-name-input]').type('Session Test Season');
    cy.get('[data-cy=season-start-date-input]').type('2024-01-01');
    cy.get('[data-cy=season-end-date-input]').type('2024-12-31');
    cy.get('[data-cy=create-season-submit]').click();

    cy.wait('@createSeason');
    cy.wait('@selectNewSeason');

    // Verify localStorage contains correct school context
    cy.window().then((win) => {
      const schoolData = JSON.parse(win.localStorage.getItem('boukii_v5_school') || '{}');
      expect(schoolData).to.have.property('id', 2);
      expect(schoolData).to.have.property('name', 'ESS Veveyse');
    });

    // Navigate to other pages and verify school context is maintained
    cy.visit('/v5/courses');
    
    // Intercept courses API to verify school context is included
    cy.intercept('GET', '**/api/v5/courses*', (req) => {
      expect(req.headers).to.have.property('x-school-id', '2');
      req.reply({ statusCode: 200, body: { success: true, data: [] } });
    }).as('getCourses');

    cy.wait('@getCourses');

    // Navigate back to dashboard
    cy.visit('/v5');
    
    // Dashboard should load without requiring season selection again
    cy.get('[data-cy=season-selector-modal]').should('not.exist');
    cy.contains('¡Bienvenido de vuelta').should('be.visible');
  });

  it('should handle network errors during season creation', () => {
    // Simulate network error
    cy.intercept('POST', '**/api/v5/seasons', { forceNetworkError: true }).as('networkError');

    cy.visit('/v5');
    
    // Try to create season
    cy.get('[data-cy=create-season-button]').click();
    cy.get('[data-cy=season-name-input]').type('Network Test Season');
    cy.get('[data-cy=season-start-date-input]').type('2024-01-01');
    cy.get('[data-cy=season-end-date-input]').type('2024-12-31');
    cy.get('[data-cy=create-season-submit]').click();

    // Error message should appear
    cy.contains('Error al crear la temporada').should('be.visible');
    
    // Form should remain open for retry
    cy.get('[data-cy=season-creation-form]').should('be.visible');
  });
});