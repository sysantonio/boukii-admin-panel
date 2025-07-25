import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Mock Data Service
import { MockDataService } from './mock-data.service';

// Interfaces
import { Course, Sport, ActivityBundle } from '../../interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ActivitySelectionServiceMock {
  private mockData = inject(MockDataService);

  /**
   * Obtener cursos recomendados
   */
  getRecommendedCourses(criteria: {
    clientId?: number;
    participantCount: number;
    level?: string;
    sportId?: number;
  }): Observable<Course[]> {
    console.log('🎿 [MOCK] Getting recommended courses:', criteria);
    return this.mockData.getRecommendedCourses(criteria);
  }

  /**
   * Obtener todos los deportes disponibles
   */
  getAvailableSports(): Observable<Sport[]> {
    console.log('🏂 [MOCK] Getting available sports');
    return this.mockData.getAvailableSports();
  }

  /**
   * Obtener cursos por deporte
   */
  getCoursesBySport(sportId: number, filters?: {
    level?: string;
    type?: string;
    maxParticipants?: number;
  }): Observable<Course[]> {
    console.log('🎯 [MOCK] Getting courses by sport:', sportId, filters);
    return this.mockData.getCoursesBySport(sportId, filters);
  }

  /**
   * Obtener paquetes de actividades
   */
  getActivityBundles(participantCount: number): Observable<ActivityBundle[]> {
    console.log('📦 [MOCK] Getting activity bundles for:', participantCount, 'participants');
    return this.mockData.getActivityBundles(participantCount);
  }

  /**
   * Comparar cursos seleccionados
   */
  compareCourses(courseIds: number[]): Observable<any> {
    console.log('⚖️ [MOCK] Comparing courses:', courseIds);
    
    const comparison = {
      courses: courseIds.map(id => {
        const course = this.mockData.getMockCourses().find(c => c.id === id);
        return {
          ...course,
          highlights: {
            bestFor: ['Principiantes', 'Grupos pequeños'],
            uniqueFeatures: ['Instructor certificado', 'Equipo incluido'],
            difficultyScore: 3.5,
            popularityScore: 4.2
          }
        };
      }),
      recommendation: {
        bestOverall: courseIds[0],
        bestValue: courseIds[1] || courseIds[0],
        mostPopular: courseIds[0],
        reasons: [
          'Mayor flexibilidad de horarios',
          'Mejor relación calidad-precio',
          'Instructor más experimentado'
        ]
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(comparison);
        observer.complete();
      }, 800);
    });
  }

  /**
   * Obtener detalles extendidos de un curso
   */
  getCourseDetails(courseId: number): Observable<any> {
    console.log('📋 [MOCK] Getting course details for:', courseId);
    
    const course = this.mockData.getMockCourses().find(c => c.id === courseId);
    const extendedDetails = {
      ...course,
      detailedDescription: 'Curso completo de esquí alpino diseñado para principiantes que quieren aprender de forma segura y divertida.',
      included: [
        'Instructor certificado',
        'Equipo de esquí básico',
        'Forfait de pistas principiantes',
        'Seguro de actividad'
      ],
      requirements: [
        'Edad mínima: 8 años',
        'Condición física básica',
        'Ropa de esquí (se puede alquilar)'
      ],
      schedule: {
        duration: '4 horas',
        breaks: '15 min cada hora',
        meetingPoint: 'Escuela de esquí - Nivel 1'
      },
      instructor: this.mockData.getMockMonitors()[0],
      reviews: {
        average: 4.8,
        total: 156,
        recent: [
          {
            client: 'María G.',
            rating: 5,
            comment: 'Excelente instructor, muy paciente con los niños',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      pricing: {
        basePrice: 285,
        priceBreakdown: {
          instruction: 200,
          equipment: 45,
          liftPass: 40
        },
        discounts: [
          { type: 'early_bird', amount: 25, condition: 'Reserva con 7+ días' },
          { type: 'group', amount: 35, condition: '4+ participantes' }
        ]
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(extendedDetails);
        observer.complete();
      }, 600);
    });
  }

  /**
   * Verificar disponibilidad rápida de curso
   */
  quickAvailabilityCheck(courseId: number, dates: string[]): Observable<any> {
    console.log('⚡ [MOCK] Quick availability check:', courseId, dates);
    
    const availability = {
      courseId,
      dates: dates.map(date => ({
        date,
        available: Math.random() > 0.3,
        slotsLeft: Math.floor(Math.random() * 6) + 1,
        waitingList: Math.floor(Math.random() * 3),
        priceIndicator: 'normal' // 'low', 'normal', 'high'
      }))
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(availability);
        observer.complete();
      }, 400);
    });
  }
}