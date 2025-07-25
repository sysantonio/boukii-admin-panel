import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { Course, Sport, ActivityBundle } from '../interfaces/shared.interfaces';

@Injectable({ providedIn: 'root' })
export class ActivitySelectionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/v3`;

  /** Obtener cursos recomendados */
  getRecommendedCourses(criteria: {
    clientId?: number;
    participantCount: number;
    level?: string;
    sportId?: number;
  }): Observable<Course[]> {
    return this.http
      .post<any>(`${this.baseUrl}/courses/recommended`, criteria)
      .pipe(
        map((res) => res.data?.courses || res.data || []),
        catchError(this.handleError)
      );
  }

  /** Obtener todos los deportes disponibles */
  getAvailableSports(): Observable<Sport[]> {
    return this.http.get<any>(`${this.baseUrl}/sports`).pipe(
      map((res) => res.data?.sports || res.data || []),
      catchError(this.handleError)
    );
  }

  /** Obtener cursos por deporte */
  getCoursesBySport(
    sportId: number,
    filters?: { level?: string; type?: string; maxParticipants?: number }
  ): Observable<Course[]> {
    const params: any = { ...filters };
    return this.http
      .get<any>(`${this.baseUrl}/sports/${sportId}/courses`, { params })
      .pipe(
        map((res) => res.data?.courses || res.data || []),
        catchError(this.handleError)
      );
  }

  /** Obtener paquetes de actividades */
  getActivityBundles(participantCount: number): Observable<ActivityBundle[]> {
    const params = { participantCount: participantCount.toString() } as any;
    return this.http
      .get<any>(`${this.baseUrl}/activities/bundles`, { params })
      .pipe(
        map((res) => res.data?.bundles || res.data || []),
        catchError(this.handleError)
      );
  }

  /** Comparar cursos seleccionados */
  compareCourses(courseIds: number[]): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/courses/compare`, { courseIds })
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Obtener detalles extendidos de un curso */
  getCourseDetails(courseId: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/courses/${courseId}`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Verificar disponibilidad rápida */
  quickAvailabilityCheck(courseId: number, dates: string[]): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/availability/quick-check`, {
        courseId,
        dates,
      })
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('ActivitySelectionService Error:', error);
    return throwError(() => error);
  }
}
