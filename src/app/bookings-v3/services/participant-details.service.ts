import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { Participant, ParticipantValidation, EmergencyContact } from '../interfaces/shared.interfaces';

@Injectable({ providedIn: 'root' })
export class ParticipantDetailsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/v3/participants`;

  /** Validar datos de participante */
  validateParticipant(participant: Partial<Participant>): Observable<ParticipantValidation> {
    return this.http
      .post<any>(`${this.baseUrl}/validate`, participant)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Obtener niveles de habilidad */
  getSkillLevels(sportId?: number): Observable<any[]> {
    const params: any = {};
    if (sportId) params.sportId = sportId.toString();
    return this.http
      .get<any>(`${this.baseUrl}/skill-levels`, { params })
      .pipe(map((res) => res.data?.levels || res.data || []), catchError(this.handleError));
  }

  /** Sugerir nivel basado en experiencia */
  suggestSkillLevel(experience: {
    yearsExperience: number;
    daysPerYear: number;
    terrainComfort: string[];
    previousLessons: boolean;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/suggest-skill`, experience)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Validar contacto de emergencia */
  validateEmergencyContact(contact: Partial<EmergencyContact>): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/validate-emergency`, contact)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Obtener equipamiento recomendado */
  getRecommendedEquipment(participant: Partial<Participant>): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/recommended-equipment`, participant)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Guardar participante temporalmente */
  saveParticipantDraft(participant: Partial<Participant>, sessionId: string): Observable<boolean> {
    return this.http
      .post<any>(`${this.baseUrl}/drafts`, { participant, sessionId })
      .pipe(map((res) => !!res.success), catchError(this.handleError));
  }

  /** Obtener restricciones médicas */
  getMedicalRestrictions(): Observable<any[]> {
    return this.http
      .get<any>(`${this.baseUrl}/medical-restrictions`)
      .pipe(map((res) => res.data?.restrictions || res.data || []), catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('ParticipantDetailsService Error:', error);
    return throwError(() => error);
  }
}
