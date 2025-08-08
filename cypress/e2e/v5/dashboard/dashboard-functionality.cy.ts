describe('V5 Dashboard Functionality', () => {
  const mockUser = {
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
    timezone: 'Europe/Madrid',
    currency: 'EUR'
  };

  const mockSeason = {
    id: 1,
    name: 'Season 2024-2025',
    start_date: '2024-09-01',
    end_date: '2025-06-30',
    is_active: true,
    is_current: true
  };

  const mockDashboardStats = {
    bookings: {
      total: 347,
      pending: 23,
      confirmed: 298,
      cancelled: 26,
      todayCount: 12,
      weeklyGrowth: 15.3,
      todayRevenue: 2450.00,
      pendingPayments: 5
    },
    clients: {
      total: 156,
      active: 142,
      newThisMonth: 18,
      vipClients: 12,
      averageAge: 32.5,
      topNationalities: ['Spanish', 'French', 'German']
    },
    revenue: {
      thisMonth: 28450.00,
      lastMonth: 24200.00,
      growth: 17.6,
      pending: 3200.00,
      dailyAverage: 945.83,
      topPaymentMethod: 'Credit Card',
      totalThisSeason: 125000.00
    },
    courses: {
      active: 8,
      upcoming: 3,
      completedThisWeek: 5,
      totalCapacity: 120,
      occupancyRate: 78.5,
      averageRating: 4.7
    },
    monitors: {
      total: 15,
      active: 12,
      available: 8,
      onLeave: 2,
      newThisMonth: 1,
      averageRating: 4.6,
      hoursWorkedThisWeek: 240
    },
    weather: {
      location: 'Sierra Nevada, Spain',
      temperature: -2.5,
      condition: 'snowy',
      windSpeed: 15,
      humidity: 85,
      visibility: 8,
      forecast: [{
        date: new Date('2025-01-07'),
        minTemp: -5,
        maxTemp: 2,
        condition: 'partly-cloudy',
        precipitationChance: 20
      }],
      lastUpdated: new Date()
    },
    salesChannels: [{
      channel: 'Online',
      bookings: 195,
      revenue: 18450.00,
      percentage: 65.0,
      growth: 12.5
    }, {
      channel: 'Phone',
      bookings: 89,
      revenue: 7200.00,
      percentage: 25.7,
      growth: -3.2
    }],
    dailySessions: [{
      date: new Date('2025-01-06'),
      morningSlots: 12,
      afternoonSlots: 8,
      totalSessions: 20,
      occupancy: 85.0
    }],
    todayReservations: [{
      id: 1234,
      clientName: 'María González',
      courseType: 'Curso Principiante',
      startTime: '09:00',
      endTime: '12:00',
      status: 'confirmed',
      paymentStatus: 'paid',
      monitorName: 'Carlos Ruiz'
    }]
  };

  const mockRecentActivity = [
    {
      id: 'act_1',
      type: 'booking',
      title: 'Nueva reserva creada',
      description: 'María González reservó Curso Principiante',
      timestamp: new Date('2025-01-06T10:30:00Z'),
      status: 'success',
      actionUrl: '/v5/bookings/1234'
    },
    {
      id: 'act_2',
      type: 'payment',
      title: 'Pago recibido',
      description: 'Pago de €45.00 confirmado para reserva #1234',
      timestamp: new Date('2025-01-06T09:15:00Z'),
      status: 'success',
      actionUrl: '/v5/payments/567'
    }
  ];

  const mockAlerts = [
    {
      id: 'alert_1',
      type: 'warning',
      title: 'Pagos pendientes',
      message: 'Hay 5 pagos pendientes por revisar',
      timestamp: new Date('2025-01-06T08:00:00Z'),
      priority: 2,
      actionUrl: '/v5/payments/pending'
    },
    {
      id: 'alert_2',
      type: 'info',
      title: 'Curso con alta demanda',
      message: 'El curso "Surf Principiante" está al 90% de capacidad',
      timestamp: new Date('2025-01-06T07:30:00Z'),
      priority: 1,
      actionUrl: '/v5/courses/3'
    }
  ];

  beforeEach(() => {
    // Set up authenticated session
    cy.window().then((window) => {
      window.localStorage.setItem('boukii_v5_token', JSON.stringify({
        access_token: 'valid-token',
        token_type: 'Bearer',
        expires_at: new Date(Date.now() + 3600000).toISOString()
      }));
      window.localStorage.setItem('boukii_v5_user', JSON.stringify(mockUser));
      window.localStorage.setItem('boukii_v5_school', JSON.stringify(mockSchool));
      window.localStorage.setItem('boukii_v5_season', JSON.stringify(mockSeason));
    });

    // Mock API responses
    cy.intercept('GET', '**/api/v5/dashboard/stats*', {
      statusCode: 200,
      body: { success: true, data: mockDashboardStats }
    }).as('getDashboardStats');

    cy.intercept('GET', '**/api/v5/dashboard/recent-activity*', {
      statusCode: 200,
      body: { success: true, data: mockRecentActivity }
    }).as('getRecentActivity');

    cy.intercept('GET', '**/api/v5/dashboard/alerts', {
      statusCode: 200,
      body: { success: true, data: mockAlerts }
    }).as('getAlerts');

    cy.intercept('GET', '**/api/v5/dashboard/daily-sessions*', {
      statusCode: 200,
      body: { success: true, data: mockDashboardStats.dailySessions }
    }).as('getDailySessions');

    cy.intercept('GET', '**/api/v5/dashboard/today-reservations*', {
      statusCode: 200,
      body: { success: true, data: mockDashboardStats.todayReservations }
    }).as('getTodayReservations');
  });

  describe('Dashboard Layout and Components', () => {
    it('should display main dashboard structure', () => {
      cy.visit('/v5/dashboard');
      
      // Wait for API calls
      cy.wait(['@getDashboardStats', '@getRecentActivity', '@getAlerts']);
      
      // Verify main layout elements
      cy.get('[data-cy=dashboard-container]').should('be.visible');
      cy.get('[data-cy=dashboard-title]').should('contain', 'Panel de Control');
      cy.get('[data-cy=season-indicator]').should('contain', mockSeason.name);
      cy.get('[data-cy=school-name]').should('contain', mockSchool.name);
      
      // Verify user context
      cy.get('[data-cy=user-welcome]').should('contain', mockUser.name);
    });

    it('should display all main widget sections', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Verify main stat widgets
      cy.get('[data-cy=bookings-widget]').should('be.visible');
      cy.get('[data-cy=clients-widget]').should('be.visible');
      cy.get('[data-cy=revenue-widget]').should('be.visible');
      cy.get('[data-cy=courses-widget]').should('be.visible');
      cy.get('[data-cy=monitors-widget]').should('be.visible');
      
      // Verify secondary sections
      cy.get('[data-cy=weather-widget]').should('be.visible');
      cy.get('[data-cy=quick-actions-section]').should('be.visible');
      cy.get('[data-cy=recent-activity-section]').should('be.visible');
      cy.get('[data-cy=alerts-section]').should('be.visible');
    });

    it('should display correct statistical data', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Bookings widget
      cy.get('[data-cy=total-bookings]').should('contain', '347');
      cy.get('[data-cy=pending-bookings]').should('contain', '23');
      cy.get('[data-cy=confirmed-bookings]').should('contain', '298');
      cy.get('[data-cy=cancelled-bookings]').should('contain', '26');
      
      // Revenue widget
      cy.get('[data-cy=monthly-revenue]').should('contain', '28.450,00 €');
      cy.get('[data-cy=revenue-growth]').should('contain', '+17,6%');
      cy.get('[data-cy=pending-revenue]').should('contain', '3.200,00 €');
      
      // Clients widget
      cy.get('[data-cy=total-clients]').should('contain', '156');
      cy.get('[data-cy=active-clients]').should('contain', '142');
      cy.get('[data-cy=new-clients-month]').should('contain', '18');
      
      // Courses widget
      cy.get('[data-cy=active-courses]').should('contain', '8');
      cy.get('[data-cy=occupancy-rate]').should('contain', '78,5%');
      cy.get('[data-cy=average-course-rating]').should('contain', '4,7');
    });

    it('should show loading states during data fetch', () => {
      // Add delay to API response
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 200,
        body: { success: true, data: mockDashboardStats },
        delay: 1000
      }).as('getStatsDelayed');
      
      cy.visit('/v5/dashboard');
      
      // Should show loading states
      cy.get('[data-cy=bookings-widget-loading]').should('be.visible');
      cy.get('[data-cy=revenue-widget-loading]').should('be.visible');
      cy.get('[data-cy=clients-widget-loading]').should('be.visible');
      
      // Wait for data to load
      cy.wait('@getStatsDelayed');
      
      // Loading states should disappear
      cy.get('[data-cy=bookings-widget-loading]').should('not.exist');
      cy.get('[data-cy=total-bookings]').should('be.visible');
    });
  });

  describe('Interactive Widgets and Actions', () => {
    it('should allow refreshing dashboard data', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Click refresh button
      cy.get('[data-cy=refresh-dashboard-button]').click();
      
      // Should make new API calls
      cy.wait('@getDashboardStats');
      cy.wait('@getRecentActivity');
      cy.wait('@getAlerts');
      
      // Should show success notification
      cy.get('[data-cy=notification-message]').should('contain', 'actualizada');
    });

    it('should navigate to detailed views from widgets', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Mock bookings page API
      cy.intercept('GET', '**/api/v5/bookings*', {
        statusCode: 200,
        body: { success: true, data: [] }
      });
      
      // Click on bookings widget
      cy.get('[data-cy=bookings-widget]').click();
      
      // Should navigate to bookings page
      cy.url().should('include', '/v5/bookings');
    });

    it('should display and interact with quick actions', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Verify quick actions are displayed
      cy.get('[data-cy=quick-action-new-booking]').should('be.visible');
      cy.get('[data-cy=quick-action-new-client]').should('be.visible');
      cy.get('[data-cy=quick-action-new-course]').should('be.visible');
      
      // Test quick action navigation
      cy.intercept('GET', '**/api/v5/bookings/new*', {
        statusCode: 200,
        body: { success: true, data: {} }
      });
      
      cy.get('[data-cy=quick-action-new-booking]').click();
      cy.url().should('include', '/v5/bookings/new');
    });

    it('should filter quick actions by user permissions', () => {
      // Set user with limited permissions
      const limitedUser = {
        ...mockUser,
        permissions: ['view_bookings'] // Limited permissions
      };
      
      cy.window().then((window) => {
        window.localStorage.setItem('boukii_v5_user', JSON.stringify(limitedUser));
      });
      
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Should only show actions user has permissions for
      cy.get('[data-cy=quick-action-new-booking]').should('not.exist');
      cy.get('[data-cy=quick-action-view-bookings]').should('be.visible');
    });

    it('should export dashboard data', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Mock export API
      cy.intercept('POST', '**/api/v5/dashboard/export', {
        statusCode: 200,
        body: { success: true, download_url: '/exports/dashboard-2025-01-06.xlsx' }
      }).as('exportDashboard');
      
      cy.get('[data-cy=export-dashboard-button]').click();
      
      // Should show export options
      cy.get('[data-cy=export-format-excel]').click();
      cy.get('[data-cy=confirm-export-button]').click();
      
      cy.wait('@exportDashboard');
      
      // Should show export success message
      cy.get('[data-cy=export-success-message]').should('be.visible');
    });
  });

  describe('Recent Activity Feed', () => {
    it('should display recent activity items', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getRecentActivity');
      
      // Verify activity items are displayed
      cy.get('[data-cy=activity-item]').should('have.length', 2);
      
      // Check first activity item
      cy.get('[data-cy=activity-item]').first().within(() => {
        cy.get('[data-cy=activity-title]').should('contain', 'Nueva reserva creada');
        cy.get('[data-cy=activity-description]').should('contain', 'María González');
        cy.get('[data-cy=activity-timestamp]').should('be.visible');
        cy.get('[data-cy=activity-status-icon]').should('have.class', 'success');
      });
    });

    it('should navigate to related items from activity', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getRecentActivity');
      
      // Mock booking details page
      cy.intercept('GET', '**/api/v5/bookings/1234', {
        statusCode: 200,
        body: { success: true, data: { id: 1234, client_name: 'María González' } }
      });
      
      // Click on activity item
      cy.get('[data-cy=activity-item]').first().click();
      
      // Should navigate to booking details
      cy.url().should('include', '/v5/bookings/1234');
    });

    it('should handle empty activity feed', () => {
      cy.intercept('GET', '**/api/v5/dashboard/recent-activity*', {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getEmptyActivity');
      
      cy.visit('/v5/dashboard');
      cy.wait('@getEmptyActivity');
      
      // Should show empty state
      cy.get('[data-cy=empty-activity-message]').should('be.visible');
      cy.get('[data-cy=empty-activity-message]').should('contain', 'Sin actividad reciente');
    });

    it('should load more activity items on demand', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getRecentActivity');
      
      // Mock load more API
      const moreActivity = [
        {
          id: 'act_3',
          type: 'client',
          title: 'Nuevo cliente registrado',
          description: 'Juan Pérez se ha registrado',
          timestamp: new Date('2025-01-05T16:20:00Z'),
          status: 'success'
        }
      ];
      
      cy.intercept('GET', '**/api/v5/dashboard/recent-activity*limit=10&offset=2', {
        statusCode: 200,
        body: { success: true, data: moreActivity }
      }).as('getMoreActivity');
      
      cy.get('[data-cy=load-more-activity-button]').click();
      
      cy.wait('@getMoreActivity');
      
      // Should show additional activity items
      cy.get('[data-cy=activity-item]').should('have.length', 3);
    });
  });

  describe('Alerts and Notifications', () => {
    it('should display active alerts', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getAlerts');
      
      // Verify alerts are displayed
      cy.get('[data-cy=alert-item]').should('have.length', 2);
      
      // Check alert content
      cy.get('[data-cy=alert-item]').first().within(() => {
        cy.get('[data-cy=alert-title]').should('contain', 'Pagos pendientes');
        cy.get('[data-cy=alert-message]').should('contain', '5 pagos pendientes');
        cy.get('[data-cy=alert-priority]').should('have.class', 'warning');
        cy.get('[data-cy=dismiss-alert-button]').should('be.visible');
      });
    });

    it('should dismiss alerts', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getAlerts');
      
      // Mock dismiss alert API
      cy.intercept('DELETE', '**/api/v5/dashboard/alerts/alert_1', {
        statusCode: 200,
        body: { success: true, message: 'Alert dismissed' }
      }).as('dismissAlert');
      
      // Dismiss first alert
      cy.get('[data-cy=alert-item]').first().within(() => {
        cy.get('[data-cy=dismiss-alert-button]').click();
      });
      
      cy.wait('@dismissAlert');
      
      // Alert should be removed from view
      cy.get('[data-cy=alert-item]').should('have.length', 1);
      
      // Should show success notification
      cy.get('[data-cy=notification-message]').should('contain', 'Alerta eliminada');
    });

    it('should navigate to alert actions', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getAlerts');
      
      // Mock payments page
      cy.intercept('GET', '**/api/v5/payments/pending*', {
        statusCode: 200,
        body: { success: true, data: [] }
      });
      
      // Click on alert action
      cy.get('[data-cy=alert-item]').first().within(() => {
        cy.get('[data-cy=alert-action-button]').click();
      });
      
      // Should navigate to payments page
      cy.url().should('include', '/v5/payments/pending');
    });

    it('should prioritize alerts by importance', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getAlerts');
      
      // Higher priority alerts should appear first
      cy.get('[data-cy=alert-item]').first().should('have.attr', 'data-priority', '2');
      cy.get('[data-cy=alert-item]').last().should('have.attr', 'data-priority', '1');
    });
  });

  describe('Weather Widget', () => {
    it('should display current weather information', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Verify weather widget content
      cy.get('[data-cy=weather-widget]').within(() => {
        cy.get('[data-cy=weather-location]').should('contain', 'Sierra Nevada');
        cy.get('[data-cy=weather-temperature]').should('contain', '-2,5°C');
        cy.get('[data-cy=weather-condition]').should('contain', 'Nevado');
        cy.get('[data-cy=weather-wind-speed]').should('contain', '15 km/h');
        cy.get('[data-cy=weather-humidity]').should('contain', '85%');
      });
    });

    it('should display weather icon based on conditions', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Should show appropriate weather icon
      cy.get('[data-cy=weather-icon]').should('have.class', 'snowy-icon');
    });

    it('should show weather forecast', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Click to expand forecast
      cy.get('[data-cy=expand-weather-button]').click();
      
      // Should show forecast items
      cy.get('[data-cy=forecast-item]').should('have.length', 1);
      cy.get('[data-cy=forecast-item]').first().within(() => {
        cy.get('[data-cy=forecast-date]').should('be.visible');
        cy.get('[data-cy=forecast-temps]').should('contain', '-5° / 2°');
        cy.get('[data-cy=forecast-condition]').should('contain', 'Parcialmente nublado');
      });
    });

    it('should handle weather data loading errors', () => {
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            ...mockDashboardStats,
            weather: null // Simulate weather API failure
          }
        }
      }).as('getStatsNoWeather');
      
      cy.visit('/v5/dashboard');
      cy.wait('@getStatsNoWeather');
      
      // Should show weather unavailable message
      cy.get('[data-cy=weather-unavailable]').should('be.visible');
      cy.get('[data-cy=weather-unavailable]').should('contain', 'Información meteorológica no disponible');
    });
  });

  describe('Today\'s Schedule', () => {
    it('should display today\'s reservations', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getTodayReservations');
      
      // Verify reservations section
      cy.get('[data-cy=todays-reservations]').should('be.visible');
      cy.get('[data-cy=reservation-item]').should('have.length', 1);
      
      // Check reservation details
      cy.get('[data-cy=reservation-item]').first().within(() => {
        cy.get('[data-cy=client-name]').should('contain', 'María González');
        cy.get('[data-cy=course-type]').should('contain', 'Curso Principiante');
        cy.get('[data-cy=reservation-time]').should('contain', '09:00 - 12:00');
        cy.get('[data-cy=monitor-name]').should('contain', 'Carlos Ruiz');
        cy.get('[data-cy=payment-status]').should('contain', 'Pagado');
      });
    });

    it('should handle empty reservations for today', () => {
      cy.intercept('GET', '**/api/v5/dashboard/today-reservations*', {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getEmptyReservations');
      
      cy.visit('/v5/dashboard');
      cy.wait('@getEmptyReservations');
      
      // Should show empty state
      cy.get('[data-cy=no-reservations-today]').should('be.visible');
      cy.get('[data-cy=no-reservations-today]').should('contain', 'Sin reservas para hoy');
    });

    it('should navigate to reservation details', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getTodayReservations');
      
      // Mock reservation details API
      cy.intercept('GET', '**/api/v5/bookings/1234', {
        statusCode: 200,
        body: { success: true, data: { id: 1234 } }
      });
      
      // Click on reservation
      cy.get('[data-cy=reservation-item]').first().click();
      
      // Should navigate to reservation details
      cy.url().should('include', '/v5/bookings/1234');
    });
  });

  describe('Performance and Analytics', () => {
    it('should display performance metrics', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Verify key performance indicators
      cy.get('[data-cy=weekly-growth]').should('contain', '+15,3%');
      cy.get('[data-cy=daily-revenue-average]').should('contain', '945,83 €');
      cy.get('[data-cy=occupancy-rate]').should('contain', '78,5%');
      cy.get('[data-cy=monitor-rating]').should('contain', '4,6');
    });

    it('should show growth indicators correctly', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Positive growth should show green
      cy.get('[data-cy=revenue-growth-indicator]').should('have.class', 'positive');
      
      // Would test negative growth with different mock data
    });

    it('should handle real-time updates', () => {
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Mock real-time update (simulated with interval refresh)
      const updatedStats = {
        ...mockDashboardStats,
        bookings: {
          ...mockDashboardStats.bookings,
          total: 348, // One more booking
          todayCount: 13
        }
      };
      
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 200,
        body: { success: true, data: updatedStats }
      }).as('getUpdatedStats');
      
      // Wait for auto-refresh (if implemented)
      cy.wait(30000); // 30 seconds
      cy.wait('@getUpdatedStats');
      
      // Should show updated data
      cy.get('[data-cy=total-bookings]').should('contain', '348');
      cy.get('[data-cy=today-bookings]').should('contain', '13');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 500,
        body: { success: false, message: 'Server error' }
      }).as('getStatsError');
      
      cy.visit('/v5/dashboard');
      cy.wait('@getStatsError');
      
      // Should show error message
      cy.get('[data-cy=dashboard-error]').should('be.visible');
      cy.get('[data-cy=dashboard-error]').should('contain', 'Error al cargar');
      
      // Should show retry button
      cy.get('[data-cy=retry-dashboard-button]').should('be.visible');
    });

    it('should retry failed requests', () => {
      // First call fails
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 500,
        body: { success: false, message: 'Server error' }
      }).as('getStatsFirstError');
      
      cy.visit('/v5/dashboard');
      cy.wait('@getStatsFirstError');
      
      // Second call succeeds
      cy.intercept('GET', '**/api/v5/dashboard/stats*', {
        statusCode: 200,
        body: { success: true, data: mockDashboardStats }
      }).as('getStatsSuccess');
      
      // Click retry
      cy.get('[data-cy=retry-dashboard-button]').click();
      cy.wait('@getStatsSuccess');
      
      // Should show dashboard data
      cy.get('[data-cy=total-bookings]').should('be.visible');
      cy.get('[data-cy=dashboard-error]').should('not.exist');
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('GET', '**/api/v5/dashboard/stats*', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/v5/dashboard');
      cy.wait('@networkError');
      
      // Should show network error message
      cy.get('[data-cy=network-error-message]').should('be.visible');
      cy.get('[data-cy=network-error-message]').should('contain', 'conexión');
    });

    it('should handle partial data loading failures', () => {
      // Stats load successfully, but activity fails
      cy.intercept('GET', '**/api/v5/dashboard/recent-activity*', {
        statusCode: 500,
        body: { success: false, message: 'Activity service unavailable' }
      }).as('getActivityError');
      
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      cy.wait('@getActivityError');
      
      // Dashboard stats should be visible
      cy.get('[data-cy=total-bookings]').should('be.visible');
      
      // Activity section should show error
      cy.get('[data-cy=activity-error]').should('be.visible');
      cy.get('[data-cy=activity-error]').should('contain', 'Error al cargar actividad');
    });
  });

  describe('Responsive Design and Mobile', () => {
    it('should adapt layout for mobile screens', () => {
      cy.viewport('iphone-x');
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Widgets should stack vertically
      cy.get('[data-cy=dashboard-widgets]').should('have.class', 'mobile-layout');
      
      // Mobile navigation should be available
      cy.get('[data-cy=mobile-menu-button]').should('be.visible');
    });

    it('should adapt layout for tablet screens', () => {
      cy.viewport('ipad-2');
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // Should use tablet-optimized layout
      cy.get('[data-cy=dashboard-widgets]').should('have.class', 'tablet-layout');
    });

    it('should maintain functionality on smaller screens', () => {
      cy.viewport(375, 667); // iPhone SE dimensions
      cy.visit('/v5/dashboard');
      cy.wait('@getDashboardStats');
      
      // All interactive elements should remain accessible
      cy.get('[data-cy=refresh-dashboard-button]').should('be.visible');
      cy.get('[data-cy=quick-action-new-booking]').should('be.visible');
      
      // Should be able to scroll to see all content
      cy.scrollTo('bottom');
      cy.get('[data-cy=recent-activity-section]').should('be.visible');
    });
  });
});