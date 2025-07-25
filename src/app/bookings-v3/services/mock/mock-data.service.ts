import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// Interfaces
import { Client, Course, Monitor, ClientSuggestion, OptimalSlot, WeatherInfo, CalendarDay, TimeSlot, ScheduleOption } from '../../interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  // ============= CLIENTES MOCK =============
  getMockClients(): Client[] {
    return [
      {
        id: 1,
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@email.com',
        phone: '+34 666 123 456',
        avatar: '/assets/img/avatars/2.jpg',
        level: 'Intermedio',
        preferredLanguage: 'es',
        dateOfBirth: new Date('1985-03-15'),
        totalBookings: 12,
        totalSpent: 1450,
        averageRating: 4.8,
        loyaltyTier: 'Gold',
        lastBooking: new Date('2024-01-15'),
        createdAt: new Date('2023-12-01'),
        tags: ['VIP', 'Familiar', 'Repetidor']
      },
      {
        id: 2,
        firstName: 'Carlos',
        lastName: 'Ruiz', 
        email: 'carlos@email.com',
        phone: '+34 666 789 012',
        avatar: '/assets/img/avatars/3.jpg',
        level: 'Principiante',
        preferredLanguage: 'es',
        totalBookings: 1,
        totalSpent: 285,
        averageRating: 5.0,
        loyaltyTier: 'Bronze',
        lastBooking: new Date('2024-01-20'),
        createdAt: new Date('2024-01-20'),
        tags: ['Nuevo']
      },
      {
        id: 3,
        firstName: 'Laura',
        lastName: 'Martín',
        email: 'laura@email.com', 
        phone: '+34 666 345 678',
        avatar: '/assets/img/avatars/4.jpg',
        level: 'Avanzado',
        preferredLanguage: 'es',
        totalBookings: 8,
        totalSpent: 945,
        averageRating: 4.6,
        loyaltyTier: 'Silver',
        lastBooking: new Date('2024-01-10'),
        createdAt: new Date('2023-11-15'),
        tags: ['Técnico', 'Independiente']
      },
      {
        id: 4,
        firstName: 'Diego',
        lastName: 'López',
        email: 'diego.lopez@email.com',
        phone: '+34 666 456 789',
        avatar: '/assets/img/avatars/5.jpg',
        level: 'Avanzado',
        preferredLanguage: 'es',
        totalBookings: 15,
        totalSpent: 2180,
        averageRating: 4.9,
        loyaltyTier: 'Platinum',
        lastBooking: new Date('2024-01-25'),
        createdAt: new Date('2023-10-01'),
        tags: ['Experto', 'Competidor']
      },
      {
        id: 5,
        firstName: 'Ana',
        lastName: 'Fernández',
        email: 'ana.fernandez@email.com',
        phone: '+34 666 567 890',
        avatar: '/assets/img/avatars/6.jpg',
        level: 'Intermedio',
        preferredLanguage: 'es',
        totalBookings: 6,
        totalSpent: 720,
        averageRating: 4.4,
        loyaltyTier: 'Silver',
        lastBooking: new Date('2024-01-12'),
        createdAt: new Date('2023-12-10'),
        tags: ['Grupal', 'Social']
      }
    ];
  }

  // ============= CURSOS MOCK =============
  getMockCourses(): Course[] {
    return [
      {
        id: 1,
        name: 'Curso Principiante',
        slug: 'curso-principiante',
        description: 'Curso ideal para quienes empiezan en el esquí. Aprende las técnicas básicas en un ambiente seguro y divertido.',
        shortDescription: 'Perfectos primeros pasos en el esquí',
        type: {
          id: 1,
          name: 'Grupal',
          slug: 'grupal',
          description: 'Clases en grupo pequeño',
          maxParticipants: 8,
          minParticipants: 4,
          priceMultiplier: 1.0,
          icon: 'groups',
          benefits: ['Interacción social', 'Precio económico', 'Motivación grupal']
        },
        sport: {
          id: 1,
          name: 'Esquí Alpino',
          slug: 'esqui-alpino',
          icon: 'downhill_skiing',
          category: 'winter',
          seasonDependent: true,
          weatherDependent: true,
          equipment: ['Esquís', 'Bastones', 'Botas'],
          difficulty: 'easy',
          minAge: 6,
          physicalRequirements: ['Capacidad de caminar', 'Equilibrio básico'],
          popularityScore: 95,
          averageRating: 4.7
        },
        level: {
          id: 1,
          name: 'Principiante',
          slug: 'principiante',
          description: 'Ideal para primeras experiencias',
          prerequisites: [],
          icon: 'trending_up',
          color: '#10B981',
          order: 1
        },
        duration: 4,
        maxParticipants: 8,
        minParticipants: 4,
        basePrice: 285,
        currency: 'EUR',
        images: ['/assets/img/courses/principiante-1.jpg', '/assets/img/courses/principiante-2.jpg'],
        features: ['Instructor especializado', 'Equipo incluido', 'Zona principiantes', 'Certificado'],
        requirements: ['Edad mínima 6 años', 'Condición física básica'],
        includes: ['4 horas de instrucción', 'Equipo completo', 'Seguro básico', 'Zona reservada'],
        excludes: ['Forfait', 'Comida', 'Transporte'],
        cancellationPolicy: {
          id: 1,
          name: 'Estándar',
          rules: [
            { hoursBeforeStart: 48, refundPercentage: 100, fees: 0, conditions: [] },
            { hoursBeforeStart: 24, refundPercentage: 50, fees: 10, conditions: [] },
            { hoursBeforeStart: 2, refundPercentage: 0, fees: 0, conditions: ['Solo en caso de emergencia'] }
          ],
          refundPercentages: [
            { timeframe: '> 48h', percentage: 100, processingFee: 0 },
            { timeframe: '24-48h', percentage: 50, processingFee: 10 },
            { timeframe: '< 24h', percentage: 0, processingFee: 0 }
          ],
          exceptions: ['Condiciones meteorológicas extremas', 'Cierre de pistas']
        },
        weatherDependent: true,
        ageRestrictions: {
          min: 6,
          requiresGuardian: true,
          guardianAge: 18,
          exceptions: ['Menores de 6 años con instructor privado']
        },
        physicalRequirements: ['Caminar sin ayuda', 'Equilibrio básico', 'Coordinación mínima'],
        equipment: [
          {
            id: 1,
            name: 'Esquís Principiante',
            type: 'required',
            category: 'Esquí',
            rentalAvailable: true,
            rentalPrice: 25,
            sizes: ['120cm', '130cm', '140cm', '150cm', '160cm'],
            description: 'Esquís específicos para aprendizaje'
          }
        ],
        location: {
          id: 1,
          name: 'Estación Base',
          address: 'Pista Verde, Sector Principiantes',
          city: 'Sierra Nevada',
          country: 'España',
          coordinates: { lat: 37.0979, lng: -3.3981 },
          timezone: 'Europe/Madrid',
          facilities: ['Vestuarios', 'Cafetería', 'Tienda', 'Primeros auxilios'],
          accessibility: {
            wheelchairAccessible: true,
            parkingAvailable: true,
            publicTransport: true,
            specialNeeds: ['Acceso para personas con movilidad reducida']
          },
          images: ['/assets/img/locations/base-1.jpg'],
          operatingHours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '08:30', close: '17:30', closed: false },
            sunday: { open: '08:30', close: '17:30', closed: false }
          },
          contactInfo: {
            phone: '+34 958 249 111',
            email: 'info@sierranevada.es',
            website: 'https://sierranevada.es',
            emergencyPhone: '+34 958 249 000'
          }
        },
        rating: 4.6,
        reviewCount: 247,
        popularityScore: 88,
        seasonality: {
          peakSeason: [
            { start: new Date('2024-12-20'), end: new Date('2024-01-07'), description: 'Navidades' },
            { start: new Date('2024-02-10'), end: new Date('2024-02-18'), description: 'Semana Blanca' }
          ],
          lowSeason: [
            { start: new Date('2024-01-08'), end: new Date('2024-02-09') },
            { start: new Date('2024-03-01'), end: new Date('2024-04-15') }
          ],
          closedDates: [],
          priceAdjustments: [
            { season: 'peak', multiplier: 1.3, description: 'Temporada alta' },
            { season: 'high', multiplier: 1.1, description: 'Temporada media-alta' },
            { season: 'medium', multiplier: 1.0, description: 'Temporada media' },
            { season: 'low', multiplier: 0.9, description: 'Temporada baja' }
          ]
        },
        tags: ['Familia', 'Seguro', 'Económico', 'Popular'],
        isActive: true,
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Curso Privado Avanzado',
        slug: 'curso-privado-avanzado',
        description: 'Clases personalizadas para esquiadores avanzados que buscan perfeccionar su técnica.',
        shortDescription: 'Perfecciona tu técnica con instructor personal',
        type: {
          id: 2,
          name: 'Privado',
          slug: 'privado',
          description: 'Clase individual personalizada',
          maxParticipants: 1,
          minParticipants: 1,
          priceMultiplier: 2.5,
          icon: 'person',
          benefits: ['Atención personalizada', 'Progreso rápido', 'Horarios flexibles']
        },
        sport: {
          id: 1,
          name: 'Esquí Alpino',
          slug: 'esqui-alpino',
          icon: 'downhill_skiing',
          category: 'winter',
          seasonDependent: true,
          weatherDependent: true,
          equipment: ['Esquís', 'Bastones', 'Botas'],
          difficulty: 'hard',
          minAge: 10,
          physicalRequirements: ['Buena condición física', 'Experiencia previa', 'Técnica básica'],
          popularityScore: 75,
          averageRating: 4.9
        },
        level: {
          id: 3,
          name: 'Avanzado',
          slug: 'avanzado',
          description: 'Para esquiadores con experiencia',
          prerequisites: ['Mínimo 3 años de experiencia', 'Dominio de pistas rojas'],
          icon: 'star',
          color: '#EF4444',
          order: 3
        },
        duration: 3,
        maxParticipants: 1,
        minParticipants: 1,
        basePrice: 450,
        currency: 'EUR',
        images: ['/assets/img/courses/privado-1.jpg', '/assets/img/courses/privado-2.jpg'],
        features: ['Instructor elite', 'Análisis técnico', 'Video feedback', 'Plan personalizado'],
        requirements: ['Experiencia mínima 3 años', 'Nivel técnico avanzado', 'Condición física excelente'],
        includes: ['3 horas privadas', 'Análisis de video', 'Plan de mejora', 'Certificado avanzado'],
        excludes: ['Equipo (opcional)', 'Forfait', 'Grabación profesional'],
        cancellationPolicy: {
          id: 2,
          name: 'Premium',
          rules: [
            { hoursBeforeStart: 24, refundPercentage: 100, fees: 0, conditions: [] },
            { hoursBeforeStart: 12, refundPercentage: 75, fees: 25, conditions: [] },
            { hoursBeforeStart: 2, refundPercentage: 25, fees: 50, conditions: [] }
          ],
          refundPercentages: [
            { timeframe: '> 24h', percentage: 100, processingFee: 0 },
            { timeframe: '12-24h', percentage: 75, processingFee: 25 },
            { timeframe: '2-12h', percentage: 25, processingFee: 50 },
            { timeframe: '< 2h', percentage: 0, processingFee: 0 }
          ],
          exceptions: ['Condiciones meteorológicas extremas', 'Lesión justificada médicamente']
        },
        weatherDependent: true,
        ageRestrictions: {
          min: 10,
          requiresGuardian: false,
          exceptions: []
        },
        physicalRequirements: ['Excelente condición física', 'Técnica avanzada confirmada', 'Resistencia alta'],
        equipment: [
          {
            id: 2,
            name: 'Esquís de Alto Rendimiento',
            type: 'recommended',
            category: 'Esquí',
            rentalAvailable: true,
            rentalPrice: 45,
            sizes: ['160cm', '170cm', '180cm'],
            description: 'Esquís de competición para técnica avanzada'
          }
        ],
        location: {
          id: 2,
          name: 'Zona Técnica',
          address: 'Pistas Negras, Sector Expertos',
          city: 'Sierra Nevada',
          country: 'España',
          coordinates: { lat: 37.1079, lng: -3.3881 },
          timezone: 'Europe/Madrid',
          facilities: ['Lodge exclusivo', 'Análisis técnico', 'Sala de video'],
          accessibility: {
            wheelchairAccessible: false,
            parkingAvailable: true,
            publicTransport: false,
            specialNeeds: []
          },
          images: ['/assets/img/locations/tecnica-1.jpg'],
          operatingHours: {
            monday: { open: '09:00', close: '16:00', closed: false },
            tuesday: { open: '09:00', close: '16:00', closed: false },
            wednesday: { open: '09:00', close: '16:00', closed: false },
            thursday: { open: '09:00', close: '16:00', closed: false },
            friday: { open: '09:00', close: '16:00', closed: false },
            saturday: { open: '08:30', close: '16:30', closed: false },
            sunday: { open: '08:30', close: '16:30', closed: false }
          },
          contactInfo: {
            phone: '+34 958 249 222',
            email: 'tecnico@sierranevada.es'
          }
        },
        rating: 4.9,
        reviewCount: 89,
        popularityScore: 65,
        seasonality: {
          peakSeason: [
            { start: new Date('2024-01-15'), end: new Date('2024-02-28'), description: 'Mejor nieve' }
          ],
          lowSeason: [
            { start: new Date('2024-03-15'), end: new Date('2024-04-15') }
          ],
          closedDates: [],
          priceAdjustments: [
            { season: 'peak', multiplier: 1.4, description: 'Temporada premium' },
            { season: 'high', multiplier: 1.2, description: 'Temporada alta' },
            { season: 'medium', multiplier: 1.0, description: 'Temporada estándar' },
            { season: 'low', multiplier: 0.85, description: 'Temporada baja' }
          ]
        },
        tags: ['Premium', 'Personalizado', 'Técnico', 'Elite'],
        isActive: true,
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2024-01-20')
      }
    ];
  }

  // ============= MONITORES MOCK =============
  getMockMonitors(): Monitor[] {
    return [
      {
        id: 1,
        firstName: 'Andrea',
        lastName: 'Ski Pro',
        email: 'andrea@sierranevada.es',
        phone: '+34 666 111 222',
        avatar: '/assets/img/monitors/andrea.jpg',
        employeeId: 'MON001',
        sports: [
          {
            id: 1,
            name: 'Esquí Alpino',
            slug: 'esqui-alpino',
            icon: 'downhill_skiing',
            category: 'winter',
            seasonDependent: true,
            weatherDependent: true,
            equipment: ['Esquís', 'Bastones', 'Botas'],
            difficulty: 'easy',
            minAge: 6,
            physicalRequirements: [],
            popularityScore: 95,
            averageRating: 4.7
          }
        ],
        certifications: [
          {
            id: 1,
            name: 'Instructor Nacional Nivel III',
            issuingOrganization: 'AENED',
            issueDate: new Date('2020-06-15'),
            expiryDate: new Date('2025-06-15'),
            level: 'Avanzado',
            isValid: true
          }
        ],
        experience: 8,
        languages: [
          { id: 1, name: 'Español', code: 'es', nativeLevel: true, proficiencyLevel: 'native' },
          { id: 2, name: 'Inglés', code: 'en', nativeLevel: false, proficiencyLevel: 'advanced' },
          { id: 3, name: 'Francés', code: 'fr', nativeLevel: false, proficiencyLevel: 'intermediate' }
        ],
        specialties: ['Principiantes', 'Familias', 'Técnica básica', 'Seguridad'],
        rating: 4.8,
        reviewCount: 156,
        availability: {
          weeklyHours: {
            monday: { available: true, startTime: '09:00', endTime: '17:00', maxHours: 8 },
            tuesday: { available: true, startTime: '09:00', endTime: '17:00', maxHours: 8 },
            wednesday: { available: true, startTime: '09:00', endTime: '17:00', maxHours: 8 },
            thursday: { available: true, startTime: '09:00', endTime: '17:00', maxHours: 8 },
            friday: { available: true, startTime: '09:00', endTime: '17:00', maxHours: 8 },
            saturday: { available: true, startTime: '08:30', endTime: '17:30', maxHours: 9 },
            sunday: { available: true, startTime: '08:30', endTime: '17:30', maxHours: 9 }
          },
          availableSlots: [],
          unavailableDates: [],
          preferredSlots: [],
          blackoutDates: [],
          lastUpdated: new Date()
        },
        pricing: {
          baseRate: 45,
          currency: 'EUR',
          rateType: 'hourly',
          premiumMultiplier: 1.2,
          groupDiscountRates: [
            { minParticipants: 4, maxParticipants: 6, discountPercentage: 10 },
            { minParticipants: 7, maxParticipants: 8, discountPercentage: 15 }
          ],
          overtimeRate: 60
        },
        workload: {
          currentWeeklyHours: 32,
          maxWeeklyHours: 40,
          utilizationRate: 0.8,
          bookingsThisWeek: 12,
          bookingsThisMonth: 48,
          averageRating: 4.8,
          fatigueScore: 0.3,
          performanceScore: 0.9,
          recommendedLoad: 35
        },
        personalityProfile: {
          traits: [
            { name: 'Paciencia', score: 0.9, description: 'Muy paciente con principiantes' },
            { name: 'Comunicación', score: 0.85, description: 'Excelente comunicador' },
            { name: 'Técnica', score: 0.8, description: 'Sólidos conocimientos técnicos' }
          ],
          workingStyle: ['Estructurado', 'Motivador', 'Seguro'],
          clientTypes: ['Familias', 'Principiantes', 'Niños'],
          strengths: ['Enseñanza básica', 'Paciencia', 'Seguridad'],
          areas_for_improvement: ['Técnica avanzada', 'Competición'],
          lastAssessment: new Date('2024-01-01')
        },
        clientFeedback: [
          {
            id: 1,
            clientId: 1,
            bookingId: 101,
            rating: 5,
            comment: 'Excelente instructora, muy paciente con mi hija',
            categories: [
              { category: 'Profesionalismo', rating: 5 },
              { category: 'Paciencia', rating: 5 },
              { category: 'Técnica', rating: 4 }
            ],
            date: new Date('2024-01-15'),
            isVerified: true
          }
        ],
        location: {
          id: 1,
          name: 'Estación Base',
          address: 'Pista Verde, Sector Principiantes',
          city: 'Sierra Nevada',
          country: 'España',
          coordinates: { lat: 37.0979, lng: -3.3981 },
          timezone: 'Europe/Madrid',
          facilities: [],
          accessibility: {
            wheelchairAccessible: true,
            parkingAvailable: true,
            publicTransport: true,
            specialNeeds: []
          },
          images: [],
          operatingHours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '08:30', close: '17:30', closed: false },
            sunday: { open: '08:30', close: '17:30', closed: false }
          },
          contactInfo: {
            phone: '+34 958 249 111',
            email: 'info@sierranevada.es'
          }
        },
        isActive: true,
        hireDate: new Date('2018-11-01'),
        lastActivityDate: new Date('2024-01-25')
      },
      {
        id: 2,
        firstName: 'Miguel',
        lastName: 'Expert',
        email: 'miguel@sierranevada.es',
        phone: '+34 666 333 444',
        avatar: '/assets/img/monitors/miguel.jpg',
        employeeId: 'MON002',
        sports: [
          {
            id: 1,
            name: 'Esquí Alpino',
            slug: 'esqui-alpino',
            icon: 'downhill_skiing',
            category: 'winter',
            seasonDependent: true,
            weatherDependent: true,
            equipment: ['Esquís', 'Bastones', 'Botas'],
            difficulty: 'expert',
            minAge: 10,
            physicalRequirements: [],
            popularityScore: 85,
            averageRating: 4.9
          }
        ],
        certifications: [
          {
            id: 2,
            name: 'Instructor Internacional',
            issuingOrganization: 'ISIA',
            issueDate: new Date('2019-05-20'),
            expiryDate: new Date('2026-05-20'),
            level: 'Elite',
            isValid: true
          }
        ],
        experience: 12,
        languages: [
          { id: 1, name: 'Español', code: 'es', nativeLevel: true, proficiencyLevel: 'native' },
          { id: 2, name: 'Inglés', code: 'en', nativeLevel: false, proficiencyLevel: 'advanced' }
        ],
        specialties: ['Técnica avanzada', 'Competición', 'Fuera pista', 'Análisis técnico'],
        rating: 4.9,
        reviewCount: 203,
        availability: {
          weeklyHours: {
            monday: { available: true, startTime: '09:00', endTime: '16:00', maxHours: 7 },
            tuesday: { available: true, startTime: '09:00', endTime: '16:00', maxHours: 7 },
            wednesday: { available: true, startTime: '09:00', endTime: '16:00', maxHours: 7 },
            thursday: { available: true, startTime: '09:00', endTime: '16:00', maxHours: 7 },
            friday: { available: true, startTime: '09:00', endTime: '16:00', maxHours: 7 },
            saturday: { available: true, startTime: '08:30', endTime: '16:30', maxHours: 8 },
            sunday: { available: false, startTime: '', endTime: '', maxHours: 0 }
          },
          availableSlots: [],
          unavailableDates: [],
          preferredSlots: [],
          blackoutDates: [],
          lastUpdated: new Date()
        },
        pricing: {
          baseRate: 65,
          currency: 'EUR',
          rateType: 'hourly',
          premiumMultiplier: 1.3,
          groupDiscountRates: [],
          specialEventRate: 80,
          overtimeRate: 85
        },
        workload: {
          currentWeeklyHours: 35,
          maxWeeklyHours: 42,
          utilizationRate: 0.83,
          bookingsThisWeek: 8,
          bookingsThisMonth: 32,
          averageRating: 4.9,
          fatigueScore: 0.4,
          performanceScore: 0.95,
          recommendedLoad: 38
        },
        personalityProfile: {
          traits: [
            { name: 'Técnica', score: 0.95, description: 'Dominio técnico excepcional' },
            { name: 'Exigencia', score: 0.8, description: 'Alto nivel de exigencia' },
            { name: 'Liderazgo', score: 0.85, description: 'Natural líder en pista' }
          ],
          workingStyle: ['Técnico', 'Exigente', 'Motivador'],
          clientTypes: ['Avanzados', 'Competidores', 'Adultos'],
          strengths: ['Técnica avanzada', 'Análisis', 'Competición'],
          areas_for_improvement: ['Paciencia con principiantes'],
          lastAssessment: new Date('2024-01-01')
        },
        clientFeedback: [
          {
            id: 2,
            clientId: 4,
            bookingId: 102,
            rating: 5,
            comment: 'Increíble técnica y conocimiento. Me ayudó a mejorar mucho mi nivel',
            categories: [
              { category: 'Profesionalismo', rating: 5 },
              { category: 'Conocimiento técnico', rating: 5 },
              { category: 'Motivación', rating: 5 }
            ],
            date: new Date('2024-01-20'),
            isVerified: true
          }
        ],
        location: {
          id: 2,
          name: 'Zona Técnica',
          address: 'Pistas Negras, Sector Expertos',
          city: 'Sierra Nevada',
          country: 'España',
          coordinates: { lat: 37.1079, lng: -3.3881 },
          timezone: 'Europe/Madrid',
          facilities: [],
          accessibility: {
            wheelchairAccessible: false,
            parkingAvailable: true,
            publicTransport: false,
            specialNeeds: []
          },
          images: [],
          operatingHours: {
            monday: { open: '09:00', close: '16:00', closed: false },
            tuesday: { open: '09:00', close: '16:00', closed: false },
            wednesday: { open: '09:00', close: '16:00', closed: false },
            thursday: { open: '09:00', close: '16:00', closed: false },
            friday: { open: '09:00', close: '16:00', closed: false },
            saturday: { open: '08:30', close: '16:30', closed: false },
            sunday: { open: '08:30', close: '16:30', closed: false }
          },
          contactInfo: {
            phone: '+34 958 249 222',
            email: 'tecnico@sierranevada.es'
          }
        },
        isActive: true,
        hireDate: new Date('2016-10-15'),
        lastActivityDate: new Date('2024-01-24')
      }
    ];
  }

  // ============= CLIMA MOCK =============
  getMockWeatherInfo(): WeatherInfo {
    return {
      date: new Date(),
      temperature: {
        current: -2,
        min: -8,
        max: 3,
        feelsLike: -5,
        unit: 'celsius'
      },
      conditions: 'Nieve ligera',
      description: 'Condiciones ideales para esquiar con nieve fresca',
      windSpeed: 15,
      windDirection: 'NO',
      humidity: 85,
      visibility: 8,
      precipitation: 0.2,
      skiConditions: {
        snowDepth: 120,
        snowQuality: 'powder',
        newSnowfall: 15,
        pistesOpen: 89,
        pistesTotal: 107,
        liftsOperational: 18,
        liftsTotal: 20,
        avalancheRisk: 2,
        conditions: 'excellent'
      },
      suitabilityScore: 0.92,
      alerts: [
        {
          id: 'weather-001',
          type: 'snow',
          severity: 'low',
          title: 'Nevada ligera',
          description: 'Se esperan 5-10cm de nieve fresca durante la mañana',
          startTime: new Date(),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          affectedActivities: []
        }
      ],
      lastUpdated: new Date()
    };
  }

  // ============= SUGGESTIONS MOCK =============
  getMockClientSuggestions(query: string): ClientSuggestion[] {
    const clients = this.getMockClients();
    return clients
      .filter(client => 
        client.firstName.toLowerCase().includes(query.toLowerCase()) ||
        client.lastName.toLowerCase().includes(query.toLowerCase()) ||
        client.email.toLowerCase().includes(query.toLowerCase())
      )
      .map(client => ({
        client,
        matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
        matchReasons: ['nombre', 'email', 'historial'].slice(0, Math.floor(Math.random() * 3) + 1)
      }));
  }

  getMockOptimalSlots(): OptimalSlot[] {
    const monitors = this.getMockMonitors();
    const weather = this.getMockWeatherInfo();
    
    return [
      {
        id: 'optimal-slot-1',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        timeSlot: {
          id: 1,
          startTime: '10:00',
          endTime: '14:00',
          duration: 240,
          label: 'Mañana',
          type: 'morning',
          isPeak: false,
          priceMultiplier: 1.0
        },
        score: 95,
        reasons: [
          { factor: 'weather', impact: 0.9, description: 'Condiciones meteorológicas excelentes', weight: 0.3 },
          { factor: 'price', impact: 0.8, description: 'Precio sin recargo por horario pico', weight: 0.2 },
          { factor: 'monitor', impact: 0.95, description: 'Monitor altamente compatible disponible', weight: 0.3 },
          { factor: 'crowd', impact: 0.9, description: 'Baja afluencia esperada', weight: 0.2 }
        ],
        monitor: monitors[0],
        expectedWeather: weather,
        crowdLevel: 'low',
        priceAdvantage: 15, // 15% más barato que la media
        availability: {
          available: true,
          spotsLeft: 6,
          totalSpots: 8,
          waitingList: 0,
          lastBooking: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      },
      {
        id: 'optimal-slot-2',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Pasado mañana
        timeSlot: {
          id: 2,
          startTime: '14:00',
          endTime: '17:00',
          duration: 180,
          label: 'Tarde',
          type: 'afternoon',
          isPeak: true,
          priceMultiplier: 1.2
        },
        score: 88,
        reasons: [
          { factor: 'weather', impact: 0.85, description: 'Muy buenas condiciones', weight: 0.3 },
          { factor: 'price', impact: 0.6, description: 'Horario pico con recargo', weight: 0.2 },
          { factor: 'monitor', impact: 0.9, description: 'Monitor especializado disponible', weight: 0.3 },
          { factor: 'crowd', impact: 0.7, description: 'Afluencia media', weight: 0.2 }
        ],
        monitor: monitors[1],
        expectedWeather: { ...weather, suitabilityScore: 0.85 },
        crowdLevel: 'medium',
        priceAdvantage: -8, // 8% más caro que la media
        availability: {
          available: true,
          spotsLeft: 2,
          totalSpots: 4,
          waitingList: 1,
          lastBooking: new Date(Date.now() - 30 * 60 * 1000)
        }
      }
    ];
  }

  // ============= MÉTODOS PÚBLICOS PARA SERVICIOS MOCK =============
  
  /**
   * Simular búsqueda de clientes con delay
   */
  searchClients(query: string): Observable<ClientSuggestion[]> {
    const suggestions = this.getMockClientSuggestions(query);
    return of(suggestions).pipe(delay(800)); // Simular latencia de red
  }

  /**
   * Obtener clientes recientes
   */
  getRecentClients(limit: number = 10): Observable<Client[]> {
    const clients = this.getMockClients()
      .sort((a, b) => (b.lastBooking?.getTime() || 0) - (a.lastBooking?.getTime() || 0))
      .slice(0, limit);
    return of(clients).pipe(delay(300));
  }

  /**
   * Obtener clientes favoritos (simulado por rating alto)
   */
  getFavoriteClients(limit: number = 6): Observable<Client[]> {
    const clients = this.getMockClients()
      .filter(client => client.averageRating >= 4.5 && client.totalBookings >= 5)
      .slice(0, limit);
    return of(clients).pipe(delay(300));
  }

  /**
   * Crear cliente nuevo
   */
  createClient(clientData: Partial<Client>): Observable<Client> {
    const newClient: Client = {
      id: Math.floor(Math.random() * 1000) + 100,
      firstName: clientData.firstName || '',
      lastName: clientData.lastName || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      level: clientData.level || 'Principiante',
      preferredLanguage: 'es',
      totalBookings: 0,
      totalSpent: 0,
      averageRating: 0,
      loyaltyTier: 'Bronze',
      createdAt: new Date(),
      tags: ['Nuevo']
    };
    return of(newClient).pipe(delay(1200));
  }

  /**
   * Obtener insights de cliente
   */
  getClientInsights(clientId: number): Observable<any> {
    const client = this.getMockClients().find(c => c.id === clientId);
    if (!client) {
      return of(null);
    }

    const insights = {
      preferences: {
        preferredSports: [
          { id: 1, name: 'Esquí Alpino' },
          { id: 2, name: 'Snowboard' }
        ],
        preferredTimeSlots: ['morning', 'afternoon'],
        budgetRange: { min: 200, max: 500 }
      },
      bookingHistory: [
        {
          id: 101,
          courseName: 'Curso Principiante',
          courseType: 'Grupal',
          date: new Date('2024-01-15'),
          status: 'completed',
          amount: 285,
          rating: 5,
          feedback: 'Excelente experiencia',
          monitor: { id: 1, firstName: 'Andrea', lastName: 'Ski Pro' },
          completionRate: 100
        },
        {
          id: 95,
          courseName: 'Clase Privada',
          courseType: 'Privado',
          date: new Date('2023-12-20'),
          status: 'completed',
          amount: 450,
          rating: 4,
          monitor: { id: 2, firstName: 'Miguel', lastName: 'Expert' },
          completionRate: 100
        }
      ],
      suggestedCourses: [
        {
          courseType: { id: 1, name: 'Intermedio' },
          confidence: 0.85,
          reason: 'Progresión natural desde principiante',
          recommendedLevel: 'Intermedio'
        },
        {
          courseType: { id: 2, name: 'Técnica Específica' },
          confidence: 0.7,
          reason: 'Interés mostrado en mejora técnica',
          recommendedLevel: 'Intermedio'
        }
      ],
      riskProfile: {
        riskLevel: 'Low' as const,
        cancellationRate: 5,
        noShowRate: 0,
        paymentDelayRate: 0,
        riskFactors: [],
        mitigation: ['Cliente fiable', 'Historial positivo']
      }
    };

    return of(insights).pipe(delay(600));
  }

  /**
   * Obtener cursos disponibles
   */
  getAvailableCourses(): Observable<Course[]> {
    return of(this.getMockCourses()).pipe(delay(400));
  }

  /**
   * Obtener cursos recomendados
   */
  getRecommendedCourses(criteria: {
    clientId?: number;
    participantCount: number;
    level?: string;
    sportId?: number;
  }): Observable<Course[]> {
    const allCourses = this.getMockCourses();
    let recommended = allCourses;

    // Filtrar por nivel si se especifica
    if (criteria.level) {
      recommended = recommended.filter(course => 
        course.level.name.toLowerCase().includes(criteria.level!.toLowerCase())
      );
    }

    // Filtrar por deporte si se especifica
    if (criteria.sportId) {
      recommended = recommended.filter(course => course.sport.id === criteria.sportId);
    }

    // Ordenar por popularidad
    recommended = recommended.sort((a, b) => b.popularityScore - a.popularityScore);

    return of(recommended).pipe(delay(600));
  }

  /**
   * Obtener deportes disponibles
   */
  getAvailableSports(): Observable<any[]> {
    const sports = [
      {
        id: 1,
        name: 'Esquí Alpino',
        slug: 'esqui-alpino',
        icon: 'downhill_skiing',
        category: 'winter',
        popularityScore: 95
      },
      {
        id: 2,
        name: 'Snowboard',
        slug: 'snowboard',
        icon: 'snowboarding',
        category: 'winter',
        popularityScore: 85
      }
    ];
    return of(sports).pipe(delay(300));
  }

  /**
   * Obtener cursos por deporte
   */
  getCoursesBySport(sportId: number, filters?: any): Observable<Course[]> {
    let courses = this.getMockCourses().filter(course => course.sport.id === sportId);
    
    // Aplicar filtros si se proporcionan
    if (filters) {
      if (filters.level) {
        courses = courses.filter(course => 
          course.level.name.toLowerCase().includes(filters.level.toLowerCase())
        );
      }
      if (filters.maxParticipants) {
        courses = courses.filter(course => course.maxParticipants <= filters.maxParticipants);
      }
    }
    
    return of(courses).pipe(delay(400));
  }

  /**
   * Obtener paquetes de actividades
   */
  getActivityBundles(participantCount?: number): Observable<any[]> {
    const bundles = [
      {
        id: 1,
        name: 'Paquete Principiante',
        description: 'Curso completo + equipo + seguro',
        courses: this.getMockCourses().slice(0, 1),
        totalPrice: 320,
        savings: 15,
        includes: ['Curso', 'Equipo', 'Seguro'],
        suitableFor: participantCount || 1
      }
    ];
    return of(bundles).pipe(delay(500));
  }

  /**
   * Obtener monitores disponibles
   */
  getAvailableMonitors(): Observable<Monitor[]> {
    return of(this.getMockMonitors()).pipe(delay(500));
  }

  /**
   * Obtener slots óptimos
   */
  getOptimalSlots(): Observable<OptimalSlot[]> {
    return of(this.getMockOptimalSlots()).pipe(delay(900));
  }

  /**
   * Calcular precio dinámico
   */
  calculateDynamicPricing(pricingData: any): Observable<any> {
    const basePrice = 285;
    const demandMultiplier = 1.1;
    const finalPrice = Math.round(basePrice * demandMultiplier);

    const pricing = {
      basePrice,
      finalPrice,
      breakdown: {
        basePrice,
        participantCount: pricingData.participantCount || 1,
        pricePerParticipant: basePrice,
        subtotal: basePrice * (pricingData.participantCount || 1),
        discounts: [],
        extras: [],
        taxes: [
          {
            id: 'vat',
            name: 'IVA',
            type: 'VAT',
            rate: 0.21,
            amount: Math.round(finalPrice * 0.21),
            description: '21% IVA'
          }
        ],
        insurance: [],
        fees: [],
        total: finalPrice + Math.round(finalPrice * 0.21),
        currency: 'EUR'
      },
      dynamicFactors: {
        demandMultiplier: 1.1,
        seasonalAdjustment: 1.0,
        weatherImpact: 1.05,
        earlyBirdDiscount: 0.95,
        loyaltyDiscount: 1.0
      },
      lastCalculated: new Date(),
      isCalculating: false
    };

    return of(pricing).pipe(delay(800));
  }

  /**
   * Validar paso del wizard
   */
  validateStep(stepNumber: number, stepData: any, wizardState: any): Observable<any> {
    const isValid = this.validateStepData(stepNumber, stepData);
    
    const result = {
      isValid,
      canProceed: isValid,
      errors: isValid ? [] : [
        {
          field: 'general',
          message: 'Datos incompletos o inválidos',
          type: 'error' as const,
          code: 'VALIDATION_001'
        }
      ],
      warnings: [],
      suggestions: []
    };

    return of(result).pipe(delay(400));
  }

  /**
   * Obtener calendario de disponibilidad
   */
  getAvailabilityCalendar(courseId: number, month?: Date): Observable<CalendarDay[]> {
    const daysInMonth = 30;
    const calendarDays: CalendarDay[] = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      calendarDays.push({
        date,
        isAvailable: Math.random() > 0.3, // 70% availability
        availableSlots: [],
        minPrice: 285,
        maxPrice: 450,
        weatherScore: Math.random(),
        crowdLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        specialEvents: Math.random() > 0.9 ? ['Evento especial'] : undefined,
        restrictions: Math.random() > 0.8 ? ['Requiere experiencia previa'] : undefined
      });
    }
    
    return of(calendarDays).pipe(delay(500));
  }

  /**
   * Obtener horarios disponibles para fecha
   */
  getAvailableTimeSlots(courseId: number, date: string): Observable<TimeSlot[]> {
    const slots: TimeSlot[] = [
      {
        id: 1,
        startTime: '09:00',
        endTime: '13:00',
        duration: 240,
        label: 'Mañana',
        type: 'morning',
        isPeak: false,
        priceMultiplier: 1.0
      },
      {
        id: 2,
        startTime: '14:00',
        endTime: '17:00',
        duration: 180,
        label: 'Tarde',
        type: 'afternoon',
        isPeak: true,
        priceMultiplier: 1.2
      }
    ];
    
    return of(slots).pipe(delay(400));
  }

  /**
   * Crear reserva simulada
   */
  createBooking(bookingData: any): Observable<any> {
    const result = {
      success: true,
      data: {
        booking: {
          id: Math.floor(Math.random() * 1000) + 1000,
          bookingNumber: `BOK${Date.now().toString().slice(-6)}`,
          status: 'confirmed',
          totalPrice: bookingData.pricing?.finalPrice || 285,
          finalBreakdown: bookingData.pricing?.breakdown,
        }
      },
      message: '¡Reserva creada exitosamente!'
    };

    return of(result).pipe(delay(2000)); // Simular procesamiento
  }

  /**
   * Guardar borrador
   */
  saveDraft(draftData: any): Observable<void> {
    console.log('Borrador guardado:', draftData);
    return of(void 0).pipe(delay(300));
  }

  // ============= HELPERS PRIVADOS =============
  
  private validateStepData(stepNumber: number, stepData: any): boolean {
    switch (stepNumber) {
      case 1: // Cliente
        return !!(stepData.selectedClient || (stepData.createNewClient && stepData.newClientData));
      case 2: // Actividad
        return !!stepData.selectedCourse;
      case 3: // Horario
        return stepData.selectedDates && stepData.selectedDates.length > 0;
      case 4: // Monitor
        return !!stepData.selectedMonitor;
      case 5: // Participantes
        return stepData.participants && stepData.participants.length > 0;
      case 6: // Pricing
        return !!stepData.finalPrice;
      default:
        return false;
    }
  }
}