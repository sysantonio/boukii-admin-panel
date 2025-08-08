import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiV5Service, ApiV5Response } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';

export interface CourseGroup {
  id: number;
  season_id: number;
  name: string;
  description?: string;
  category: string;
  level: string;
  duration_minutes: number;
  max_participants: number;
  min_participants: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseRequest {
  name: string;
  description?: string;
  category: string;
  level: string;
  duration_minutes: number;
  max_participants: number;
  min_participants: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService
  ) {}

  getCourseGroups(): Observable<CourseGroup[]> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    const params = currentSeasonId ? { season_id: currentSeasonId } : undefined;

    return this.apiV5.get<ApiV5Response<CourseGroup[]>>('courses', params).pipe(
      map(response => response.success ? response.data : []),
      tap(courses => console.log(`[CourseService] Loaded ${courses.length} course groups`)),
      catchError(error => {
        console.error('[CourseService] Error loading course groups:', error);
        throw error;
      })
    );
  }

  getCourseById(id: number): Observable<CourseGroup> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    const params = currentSeasonId ? { season_id: currentSeasonId } : undefined;

    return this.apiV5.get<ApiV5Response<CourseGroup>>(`courses/${id}`, params).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Course not found');
      }),
      tap(course => console.log(`[CourseService] Loaded course:`, course)),
      catchError(error => {
        console.error('[CourseService] Error loading course:', error);
        throw error;
      })
    );
  }

  createCourse(courseData: CreateCourseRequest): Observable<CourseGroup> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    const payload = {
      ...courseData,
      season_id: currentSeasonId
    };

    return this.apiV5.post<ApiV5Response<CourseGroup>>('courses', payload).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to create course');
      }),
      tap(course => console.log(`[CourseService] Created course:`, course)),
      catchError(error => {
        console.error('[CourseService] Error creating course:', error);
        throw error;
      })
    );
  }

  updateCourse(id: number, courseData: Partial<CourseGroup>): Observable<CourseGroup> {
    return this.apiV5.put<ApiV5Response<CourseGroup>>(`courses/${id}`, courseData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to update course');
      }),
      tap(course => console.log(`[CourseService] Updated course:`, course)),
      catchError(error => {
        console.error('[CourseService] Error updating course:', error);
        throw error;
      })
    );
  }

  deleteCourse(id: number): Observable<void> {
    return this.apiV5.delete<ApiV5Response<void>>(`courses/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to delete course');
        }
      }),
      tap(() => console.log(`[CourseService] Deleted course ${id}`)),
      catchError(error => {
        console.error('[CourseService] Error deleting course:', error);
        throw error;
      })
    );
  }
}