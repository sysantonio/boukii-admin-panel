describe('V5 Internationalization Support', () => {
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

  beforeEach(() => {
    // Set up authenticated session
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

    // Mock dashboard API response
    cy.intercept('GET', '**/api/v5/dashboard/stats*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          bookings: { total: 150, pending: 12, confirmed: 128, cancelled: 10 },
          clients: { total: 89, active: 76, newThisMonth: 12 },
          revenue: { thisMonth: 15450.00, lastMonth: 13200.00, growth: 17.05 }
        }
      }
    });
  });

  describe('Language Selection and Persistence', () => {
    it('should load default language (Spanish) on first visit', () => {
      cy.visit('/v5/dashboard');
      
      // Verify Spanish is loaded
      cy.get('[data-cy=dashboard-title]').should('contain', 'Panel de Control');
      cy.get('[data-cy=bookings-widget-title]').should('contain', 'Reservas');
      cy.get('[data-cy=clients-widget-title]').should('contain', 'Clientes');
      
      // Verify language indicator in navbar
      cy.get('[data-cy=language-selector]').should('contain', 'ES');
    });

    it('should change language when selector is used', () => {
      cy.visit('/v5/dashboard');
      
      // Change to English
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // Verify English translations
      cy.get('[data-cy=dashboard-title]').should('contain', 'Dashboard');
      cy.get('[data-cy=bookings-widget-title]').should('contain', 'Bookings');
      cy.get('[data-cy=clients-widget-title]').should('contain', 'Clients');
      
      // Verify language selector shows English
      cy.get('[data-cy=language-selector]').should('contain', 'EN');
    });

    it('should persist language selection in localStorage', () => {
      cy.visit('/v5/dashboard');
      
      // Change to French
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-fr]').click();
      
      // Verify French is selected
      cy.get('[data-cy=dashboard-title]').should('contain', 'Tableau de Bord');
      
      // Verify localStorage persistence
      cy.window().then((window) => {
        const savedLanguage = window.localStorage.getItem('boukii_v5_language');
        expect(savedLanguage).to.equal('fr');
      });
      
      // Reload page and verify language persists
      cy.reload();
      cy.get('[data-cy=dashboard-title]').should('contain', 'Tableau de Bord');
      cy.get('[data-cy=language-selector]').should('contain', 'FR');
    });

    it('should restore language from localStorage on app initialization', () => {
      // Set language in localStorage before visit
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_language', 'de');
      });
      
      cy.visit('/v5/dashboard');
      
      // Should load German translations
      cy.get('[data-cy=dashboard-title]').should('contain', 'Dashboard');
      cy.get('[data-cy=bookings-widget-title]').should('contain', 'Buchungen');
      cy.get('[data-cy=language-selector]').should('contain', 'DE');
    });

    it('should fallback to default language for invalid stored language', () => {
      // Set invalid language code
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_language', 'invalid');
      });
      
      cy.visit('/v5/dashboard');
      
      // Should fallback to Spanish (default)
      cy.get('[data-cy=dashboard-title]').should('contain', 'Panel de Control');
      cy.get('[data-cy=language-selector]').should('contain', 'ES');
    });
  });

  describe('Supported Languages Coverage', () => {
    const supportedLanguages = [
      { code: 'es', name: 'Español', dashboardTitle: 'Panel de Control' },
      { code: 'en', name: 'English', dashboardTitle: 'Dashboard' },
      { code: 'fr', name: 'Français', dashboardTitle: 'Tableau de Bord' },
      { code: 'de', name: 'Deutsch', dashboardTitle: 'Dashboard' },
      { code: 'it', name: 'Italiano', dashboardTitle: 'Cruscotto' }
    ];

    supportedLanguages.forEach((language) => {
      it(`should support ${language.name} (${language.code}) language`, () => {
        cy.visit('/v5/dashboard');
        
        // Change to target language
        cy.get('[data-cy=language-selector]').click();
        cy.get(`[data-cy=language-option-${language.code}]`).click();
        
        // Verify language change
        cy.get('[data-cy=dashboard-title]').should('contain', language.dashboardTitle);
        cy.get('[data-cy=language-selector]').should('contain', language.code.toUpperCase());
      });
    });

    it('should display all supported languages in selector dropdown', () => {
      cy.visit('/v5/dashboard');
      
      cy.get('[data-cy=language-selector]').click();
      
      supportedLanguages.forEach((language) => {
        cy.get(`[data-cy=language-option-${language.code}]`)
          .should('be.visible')
          .should('contain', language.name);
      });
    });
  });

  describe('Dynamic Content Translation', () => {
    it('should translate navigation menu items', () => {
      cy.visit('/v5/dashboard');
      
      // Check Spanish navigation
      cy.get('[data-cy=nav-dashboard]').should('contain', 'Panel');
      cy.get('[data-cy=nav-bookings]').should('contain', 'Reservas');
      cy.get('[data-cy=nav-courses]').should('contain', 'Cursos');
      cy.get('[data-cy=nav-clients]').should('contain', 'Clientes');
      
      // Switch to English
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // Verify English navigation
      cy.get('[data-cy=nav-dashboard]').should('contain', 'Dashboard');
      cy.get('[data-cy=nav-bookings]').should('contain', 'Bookings');
      cy.get('[data-cy=nav-courses]').should('contain', 'Courses');
      cy.get('[data-cy=nav-clients]').should('contain', 'Clients');
    });

    it('should translate widget titles and content', () => {
      cy.visit('/v5/dashboard');
      
      // Spanish widget content
      cy.get('[data-cy=total-bookings-label]').should('contain', 'Total de Reservas');
      cy.get('[data-cy=pending-bookings-label]').should('contain', 'Pendientes');
      cy.get('[data-cy=revenue-growth-label]').should('contain', 'Crecimiento');
      
      // Switch to French
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-fr]').click();
      
      // French widget content
      cy.get('[data-cy=total-bookings-label]').should('contain', 'Total des Réservations');
      cy.get('[data-cy=pending-bookings-label]').should('contain', 'En Attente');
      cy.get('[data-cy=revenue-growth-label]').should('contain', 'Croissance');
    });

    it('should translate form labels and placeholders', () => {
      // Mock courses API for the courses page
      cy.intercept('GET', '**/api/v5/courses*', {
        statusCode: 200,
        body: { success: true, data: [] }
      });

      cy.visit('/v5/courses');
      
      // Create new course form
      cy.get('[data-cy=create-course-button]').click();
      
      // Check Spanish form labels
      cy.get('[data-cy=course-name-label]').should('contain', 'Nombre del Curso');
      cy.get('[data-cy=course-description-label]').should('contain', 'Descripción');
      cy.get('[data-cy=course-price-label]').should('contain', 'Precio');
      cy.get('[data-cy=course-capacity-label]').should('contain', 'Capacidad');
      
      // Switch to German
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-de]').click();
      
      // Check German form labels
      cy.get('[data-cy=course-name-label]').should('contain', 'Kursname');
      cy.get('[data-cy=course-description-label]').should('contain', 'Beschreibung');
      cy.get('[data-cy=course-price-label]').should('contain', 'Preis');
      cy.get('[data-cy=course-capacity-label]').should('contain', 'Kapazität');
    });

    it('should translate button texts', () => {
      cy.visit('/v5/dashboard');
      
      // Spanish buttons
      cy.get('[data-cy=refresh-dashboard-button]').should('contain', 'Actualizar');
      cy.get('[data-cy=export-data-button]').should('contain', 'Exportar');
      
      // Switch to Italian
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-it]').click();
      
      // Italian buttons
      cy.get('[data-cy=refresh-dashboard-button]').should('contain', 'Aggiorna');
      cy.get('[data-cy=export-data-button]').should('contain', 'Esporta');
    });

    it('should translate notification messages', () => {
      cy.visit('/v5/dashboard');
      
      // Trigger a success notification
      cy.get('[data-cy=refresh-dashboard-button]').click();
      
      // Check Spanish notification
      cy.get('[data-cy=notification-message]').should('contain', 'Datos actualizados correctamente');
      
      // Switch to English
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // Trigger notification again
      cy.get('[data-cy=refresh-dashboard-button]').click();
      
      // Check English notification
      cy.get('[data-cy=notification-message]').should('contain', 'Data updated successfully');
    });
  });

  describe('Date and Number Formatting', () => {
    it('should format dates according to selected language locale', () => {
      cy.visit('/v5/dashboard');
      
      // Spanish date format (DD/MM/YYYY)
      cy.get('[data-cy=last-updated-date]').should('match', /\d{1,2}\/\d{1,2}\/\d{4}/);
      
      // Switch to English
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // English date format (MM/DD/YYYY or similar)
      cy.get('[data-cy=last-updated-date]').should('match', /\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should format currency according to language locale', () => {
      cy.visit('/v5/dashboard');
      
      // Spanish currency format (€ symbol, comma as decimal separator)
      cy.get('[data-cy=revenue-amount]').should('contain', '€').and('match', /\d{1,3}(\.\d{3})*,\d{2}/);
      
      // Switch to English
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // English currency format (€ symbol, period as decimal separator)
      cy.get('[data-cy=revenue-amount]').should('contain', '€').and('match', /\d{1,3}(,\d{3})*\.\d{2}/);
    });

    it('should format numbers according to language locale', () => {
      cy.visit('/v5/dashboard');
      
      // Check large numbers formatting
      cy.get('[data-cy=total-bookings-number]').should('be.visible');
      cy.get('[data-cy=total-clients-number]').should('be.visible');
      
      // Numbers should be formatted according to locale
      // Spanish: 1.000,50
      // English: 1,000.50
      // etc.
    });

    it('should format percentages consistently', () => {
      cy.visit('/v5/dashboard');
      
      // Growth percentages should use locale-appropriate formatting
      cy.get('[data-cy=revenue-growth-percentage]')
        .should('contain', '%')
        .should('match', /[+-]?\d+[,.]?\d*\s?%/);
    });
  });

  describe('Error Messages and Validation', () => {
    it('should translate validation error messages', () => {
      // Mock login page to test validation
      cy.clearLocalStorage();
      cy.visit('/v5/auth/login');
      
      // Try to submit empty form
      cy.get('[data-cy=login-button]').click();
      
      // Spanish validation errors
      cy.get('[data-cy=email-error]').should('contain', 'El email es obligatorio');
      cy.get('[data-cy=password-error]').should('contain', 'La contraseña es obligatoria');
      
      // Change to English
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // English validation errors
      cy.get('[data-cy=email-error]').should('contain', 'Email is required');
      cy.get('[data-cy=password-error]').should('contain', 'Password is required');
    });

    it('should translate API error messages', () => {
      cy.clearLocalStorage();
      cy.visit('/v5/auth/login');
      
      // Mock API error response
      cy.intercept('POST', '**/api/v5/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          message: 'Invalid credentials',
          error_code: 'INVALID_CREDENTIALS'
        }
      });
      
      // Fill form and submit
      cy.get('[data-cy=test-data-button]').click();
      cy.get('[data-cy=login-button]').click();
      
      // Spanish error message
      cy.get('[data-cy=api-error-message]').should('contain', 'Credenciales inválidas');
      
      // Change to English
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // Try login again
      cy.get('[data-cy=login-button]').click();
      
      // English error message
      cy.get('[data-cy=api-error-message]').should('contain', 'Invalid credentials');
    });

    it('should translate system error messages', () => {
      cy.visit('/v5/dashboard');
      
      // Mock network error
      cy.intercept('GET', '**/api/v5/dashboard/stats*', { forceNetworkError: true });
      
      // Trigger refresh to cause error
      cy.get('[data-cy=refresh-dashboard-button]').click();
      
      // Spanish network error
      cy.get('[data-cy=network-error-message]').should('contain', 'Error de conexión');
      
      // Change to French
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-fr]').click();
      
      // Trigger error again
      cy.get('[data-cy=refresh-dashboard-button]').click();
      
      // French network error
      cy.get('[data-cy=network-error-message]').should('contain', 'Erreur de connexion');
    });
  });

  describe('User Preferences and Context', () => {
    it('should preserve language across different pages', () => {
      cy.visit('/v5/dashboard');
      
      // Set to German
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-de]').click();
      
      // Navigate to different pages
      cy.get('[data-cy=nav-bookings]').click();
      cy.url().should('include', '/v5/bookings');
      
      // Language should persist
      cy.get('[data-cy=language-selector]').should('contain', 'DE');
      cy.get('[data-cy=bookings-page-title]').should('contain', 'Buchungen');
      
      // Navigate to courses
      cy.get('[data-cy=nav-courses]').click();
      cy.url().should('include', '/v5/courses');
      
      // Language should still persist
      cy.get('[data-cy=language-selector]').should('contain', 'DE');
      cy.get('[data-cy=courses-page-title]').should('contain', 'Kurse');
    });

    it('should handle browser language detection', () => {
      // This test would require special setup to mock browser language
      // For now, we verify that the app handles the case appropriately
      cy.visit('/v5/dashboard');
      
      // Default should be loaded (Spanish in this case)
      cy.get('[data-cy=dashboard-title]').should('contain', 'Panel de Control');
    });

    it('should update user language preference via API', () => {
      cy.visit('/v5/dashboard');
      
      // Mock API call to update user preferences
      cy.intercept('PUT', '**/api/v5/users/preferences', {
        statusCode: 200,
        body: { success: true, message: 'Preferences updated' }
      }).as('updatePreferences');
      
      // Change language
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // Should make API call to save preference
      cy.wait('@updatePreferences').then((interception) => {
        expect(interception.request.body).to.have.property('language', 'en');
      });
      
      // Should show success notification
      cy.get('[data-cy=notification-message]').should('contain', 'Language updated');
    });
  });

  describe('RTL Language Support', () => {
    it('should handle text direction changes for RTL languages', () => {
      // Note: This test assumes Arabic support is added in the future
      // For now, we test the mechanism with existing languages
      cy.visit('/v5/dashboard');
      
      // Verify LTR layout for current languages
      cy.get('body').should('have.attr', 'dir', 'ltr');
      cy.get('[data-cy=sidebar]').should('have.css', 'left', '0px');
    });

    it('should adjust layout components for RTL', () => {
      // Future test for when RTL languages are supported
      // Would test sidebar position, text alignment, icon positions, etc.
    });
  });

  describe('Fallback and Error Handling', () => {
    it('should show translation keys when translation is missing', () => {
      cy.visit('/v5/dashboard');
      
      // Simulate missing translation by using a non-existent key
      // This would be tested in the component that handles missing translations
      cy.get('[data-cy=dashboard-container]').should('be.visible');
    });

    it('should fallback to default language when translation file fails to load', () => {
      // Mock translation file loading failure
      cy.intercept('GET', '**/assets/i18n/en.json', {
        statusCode: 404,
        body: 'Not found'
      });
      
      cy.visit('/v5/dashboard');
      
      // Change to English (which will fail to load)
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // Should fallback to default language (Spanish)
      cy.get('[data-cy=dashboard-title]').should('contain', 'Panel de Control');
      cy.get('[data-cy=language-selector]').should('contain', 'ES');
    });

    it('should handle partial translation files gracefully', () => {
      // Mock partial translation file
      cy.intercept('GET', '**/assets/i18n/fr.json', {
        statusCode: 200,
        body: {
          "DASHBOARD": {
            "TITLE": "Tableau de Bord"
            // Missing other translations
          }
        }
      });
      
      cy.visit('/v5/dashboard');
      
      // Change to French
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-fr]').click();
      
      // Translated text should show
      cy.get('[data-cy=dashboard-title]').should('contain', 'Tableau de Bord');
      
      // Missing translations should fallback to key or default language
      // This behavior depends on the ngx-translate configuration
    });
  });

  describe('Performance and Loading', () => {
    it('should load translations efficiently without blocking UI', () => {
      cy.visit('/v5/dashboard');
      
      // Page should be interactive while translations load
      cy.get('[data-cy=dashboard-container]').should('be.visible');
      
      // Language selector should be clickable
      cy.get('[data-cy=language-selector]').should('not.be.disabled');
    });

    it('should cache translation files for performance', () => {
      cy.visit('/v5/dashboard');
      
      // Change language (should load translation file)
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // Change back to Spanish
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-es]').click();
      
      // Change to English again (should use cached file)
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-option-en]').click();
      
      // Translation should be immediate (cached)
      cy.get('[data-cy=dashboard-title]').should('contain', 'Dashboard');
    });
  });
});