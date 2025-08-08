import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { ApiV5Response } from '../../../core/models/api-response.interface';

export interface School {
  id: number;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  settings?: any;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchoolService {

  constructor(
    private apiV5: ApiV5Service
  ) {}

  getSchools(): Observable<School[]> {
    return this.apiV5.get<ApiV5Response<School[]>>('schools').pipe(
      map(response => response.success ? response.data : []),
      tap(schools => console.log(`[SchoolService] Loaded ${schools.length} schools`)),
      catchError(error => {
        console.error('[SchoolService] Error loading schools:', error);
        throw error;
      })
    );
  }

  getSchool(id: number): Observable<School> {
    return this.apiV5.get<ApiV5Response<School>>(`schools/${id}`).pipe(
      map(response => response.data),
      tap(school => console.log(`[SchoolService] Loaded school:`, school?.name)),
      catchError(error => {
        console.error(`[SchoolService] Error loading school ${id}:`, error);
        throw error;
      })
    );
  }

  getCurrentSchool(): Observable<School> {
    return this.apiV5.get<ApiV5Response<School>>('schools/current').pipe(
      map(response => response.data),
      tap(school => console.log(`[SchoolService] Current school:`, school?.name)),
      catchError(error => {
        console.error('[SchoolService] Error loading current school:', error);
        throw error;
      })
    );
  }

  updateCurrentSchool(data: Partial<School>): Observable<School> {
    return this.apiV5.put<ApiV5Response<School>>('schools/current', data).pipe(
      map(response => response.data),
      tap(school => console.log(`[SchoolService] Updated current school:`, school?.name)),
      catchError(error => {
        console.error('[SchoolService] Error updating current school:', error);
        throw error;
      })
    );
  }

  createSchool(data: Partial<School>): Observable<School> {
    return this.apiV5.post<ApiV5Response<School>>('schools', data).pipe(
      map(response => response.data),
      tap(school => console.log(`[SchoolService] Created school:`, school?.name)),
      catchError(error => {
        console.error('[SchoolService] Error creating school:', error);
        throw error;
      })
    );
  }

  updateSchool(id: number, data: Partial<School>): Observable<School> {
    return this.apiV5.put<ApiV5Response<School>>(`schools/${id}`, data).pipe(
      map(response => response.data),
      tap(school => console.log(`[SchoolService] Updated school:`, school?.name)),
      catchError(error => {
        console.error(`[SchoolService] Error updating school ${id}:`, error);
        throw error;
      })
    );
  }

  deleteSchool(id: number): Observable<void> {
    return this.apiV5.delete<ApiV5Response<void>>(`schools/${id}`).pipe(
      map(() => void 0),
      tap(() => console.log(`[SchoolService] Deleted school ${id}`)),
      catchError(error => {
        console.error(`[SchoolService] Error deleting school ${id}:`, error);
        throw error;
      })
    );
  }
}
