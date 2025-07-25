import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Mock Data Service
import { MockDataService } from './mock-data.service';

// Interfaces
import { Participant, ParticipantValidation, EmergencyContact } from '../../interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ParticipantDetailsServiceMock {
  private mockData = inject(MockDataService);

  /**
   * Validar datos de participante
   */
  validateParticipant(participant: Partial<Participant>): Observable<ParticipantValidation> {
    console.log('✅ [MOCK] Validating participant:', participant);
    
    const validation: ParticipantValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      riskAssessment: {
        level: 'low',
        factors: [],
        recommendations: []
      }
    };

    // Simular algunas validaciones
    if (participant.age && participant.age < 8) {
      validation.isValid = false;
      validation.errors.push({
        field: 'age',
        message: 'La edad mínima es 8 años',
        code: 'MIN_AGE_REQUIRED'
      });
    }

    if (participant.age && participant.age > 65) {
      validation.warnings.push({
        field: 'age',
        message: 'Se recomienda evaluación médica para mayores de 65 años',
        code: 'SENIOR_MEDICAL_CHECK'
      });
      validation.suggestions.push({
        field: 'medicalConditions',
        message: 'Considere añadir información médica relevante',
        action: 'ADD_MEDICAL_INFO'
      });
    }

    if (participant.level === 'beginner' && participant.age && participant.age < 12) {
      validation.suggestions.push({
        field: 'courseType',
        message: 'Curso de niños podría ser más apropiado',
        action: 'SUGGEST_KIDS_COURSE'
      });
    }

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(validation);
        observer.complete();
      }, 400);
    });
  }

  /**
   * Obtener niveles de habilidad disponibles
   */
  getSkillLevels(sportId?: number): Observable<any[]> {
    console.log('📊 [MOCK] Getting skill levels for sport:', sportId);
    
    const levels = [
      {
        id: 'beginner',
        name: 'Principiante',
        description: 'Primera vez o muy poca experiencia',
        icon: '🌱',
        requirements: ['Ninguno'],
        expectedSkills: ['Postura básica', 'Deslizamiento controlado'],
        recommendedAge: '8+ años'
      },
      {
        id: 'intermediate',
        name: 'Intermedio',
        description: 'Puede hacer giros básicos en pistas verdes/azules',
        icon: '🏔️',
        requirements: ['Giros básicos', 'Control de velocidad'],
        expectedSkills: ['Giros paralelos', 'Pistas azules cómodamente'],
        recommendedAge: '10+ años'
      },
      {
        id: 'advanced',
        name: 'Avanzado',
        description: 'Esquía con confianza en pistas rojas',
        icon: '⚡',
        requirements: ['Giros paralelos', 'Pistas rojas'],
        expectedSkills: ['Técnica refinada', 'Pistas negras'],
        recommendedAge: '12+ años'
      },
      {
        id: 'expert',
        name: 'Experto',
        description: 'Domina todas las técnicas y terrenos',
        icon: '🏆',
        requirements: ['Pistas negras', 'Fuera de pista'],
        expectedSkills: ['Competición', 'Terreno extremo'],
        recommendedAge: '14+ años'
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(levels);
        observer.complete();
      }, 300);
    });
  }

  /**
   * Sugerir nivel basado en experiencia
   */
  suggestSkillLevel(experience: {
    yearsExperience: number;
    daysPerYear: number;
    terrainComfort: string[];
    previousLessons: boolean;
  }): Observable<any> {
    console.log('🎯 [MOCK] Suggesting skill level based on experience:', experience);
    
    let suggestedLevel = 'beginner';
    let confidence = 0.8;
    let reasons = [];

    if (experience.yearsExperience === 0) {
      suggestedLevel = 'beginner';
      reasons.push('Primera experiencia');
    } else if (experience.yearsExperience < 3 && experience.daysPerYear < 10) {
      suggestedLevel = 'beginner';
      reasons.push('Poca experiencia acumulada');
    } else if (experience.yearsExperience >= 3 && experience.daysPerYear >= 10) {
      suggestedLevel = 'intermediate';
      reasons.push('Experiencia regular');
    }

    if (experience.terrainComfort.includes('red_slopes')) {
      suggestedLevel = 'advanced';
      reasons.push('Cómodo en pistas rojas');
    }

    if (experience.terrainComfort.includes('black_slopes')) {
      suggestedLevel = 'expert';
      reasons.push('Esquía pistas negras');
    }

    const suggestion = {
      level: suggestedLevel,
      confidence,
      reasons,
      alternatives: [
        {
          level: suggestedLevel === 'beginner' ? 'intermediate' : 'beginner',
          reason: 'Si se siente más/menos cómodo',
          confidence: 0.6
        }
      ],
      assessment: {
        score: Math.floor(Math.random() * 100),
        strengths: ['Actitud positiva', 'Interés en aprender'],
        areasToImprove: ['Técnica básica', 'Confianza']
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(suggestion);
        observer.complete();
      }, 600);
    });
  }

  /**
   * Validar contacto de emergencia
   */
  validateEmergencyContact(contact: Partial<EmergencyContact>): Observable<any> {
    console.log('📞 [MOCK] Validating emergency contact:', contact);
    
    const validation = {
      isValid: true,
      errors: [],
      suggestions: []
    };

    if (!contact.phone || contact.phone.length < 9) {
      validation.isValid = false;
      validation.errors.push({
        field: 'phone',
        message: 'Número de teléfono requerido',
        code: 'PHONE_REQUIRED'
      });
    }

    if (!contact.relationship || contact.relationship.trim() === '') {
      validation.errors.push({
        field: 'relationship',
        message: 'Relación con el participante requerida',
        code: 'RELATIONSHIP_REQUIRED'
      });
    }

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(validation);
        observer.complete();
      }, 200);
    });
  }

  /**
   * Obtener equipamiento recomendado
   */
  getRecommendedEquipment(participant: Partial<Participant>): Observable<any> {
    console.log('🎿 [MOCK] Getting recommended equipment for participant:', participant);
    
    const equipment = {
      required: [
        {
          item: 'Casco',
          description: 'Obligatorio para menores de 18 años',
          rental: true,
          price: 15,
          priority: 'high'
        },
        {
          item: 'Esquís y bastones',
          description: 'Apropiados para el nivel',
          rental: true,
          price: 25,
          priority: 'high'
        },
        {
          item: 'Botas de esquí',
          description: 'Talla correcta es fundamental',
          rental: true,
          price: 20,
          priority: 'high'
        }
      ],
      recommended: [
        {
          item: 'Gafas de sol/máscara',
          description: 'Protección UV esencial',
          rental: true,
          price: 10,
          priority: 'medium'
        },
        {
          item: 'Guantes impermeables',
          description: 'Para mayor comodidad',
          rental: false,
          price: 0,
          priority: 'medium'
        }
      ],
      clothing: [
        {
          layer: 'Base',
          items: ['Ropa térmica'],
          notes: 'Evitar algodón'
        },
        {
          layer: 'Intermedia',
          items: ['Forro polar o softshell'],
          notes: 'Para ajustar temperatura'
        },
        {
          layer: 'Externa',
          items: ['Chaqueta y pantalón de esquí'],
          notes: 'Impermeables y transpirables'
        }
      ],
      totalRentalCost: 70,
      discounts: [
        {
          type: 'package',
          description: 'Pack completo',
          savings: 10
        }
      ]
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(equipment);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Guardar participante temporalmente
   */
  saveParticipantDraft(participant: Partial<Participant>, sessionId: string): Observable<boolean> {
    console.log('💾 [MOCK] Saving participant draft:', participant, sessionId);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(true);
        observer.complete();
      }, 300);
    });
  }

  /**
   * Obtener restricciones médicas comunes
   */
  getMedicalRestrictions(): Observable<any[]> {
    console.log('🏥 [MOCK] Getting medical restrictions');
    
    const restrictions = [
      {
        id: 'heart_condition',
        name: 'Problemas cardíacos',
        severity: 'high',
        requiresMedicalClearance: true,
        description: 'Requiere autorización médica'
      },
      {
        id: 'back_problems',
        name: 'Problemas de espalda',
        severity: 'medium',
        requiresMedicalClearance: false,
        description: 'Informar al instructor'
      },
      {
        id: 'knee_injury',
        name: 'Lesión de rodilla',
        severity: 'medium',
        requiresMedicalClearance: false,
        description: 'Precaución extra necesaria'
      },
      {
        id: 'pregnancy',
        name: 'Embarazo',
        severity: 'high',
        requiresMedicalClearance: true,
        description: 'No recomendado después del primer trimestre'
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(restrictions);
        observer.complete();
      }, 250);
    });
  }
}