import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { Course, CourseTemplate, CourseGroup, CourseSubgroup } from '../../../core/models/course.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseSeasonService {
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public courses$ = this.coursesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService
  ) {}

  async getCoursesBySeason(seasonId?: number): Promise<Course[]> {
    this.loadingSubject.next(true);
    try {
      const currentSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();
      if (!currentSeasonId) {
        throw new Error('No season selected');
      }

      const response = await this.apiV5
        .get<ApiResponse<Course[]>>(`seasons/${currentSeasonId}/courses`)
        .toPromise();
      
      const courses = response?.data || [];
      this.coursesSubject.next(courses);
      return courses;
    } catch (error) {
      console.error('Error loading courses:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async getCourseById(courseId: number): Promise<Course> {
    const response = await this.apiV5
      .get<ApiResponse<Course>>(`courses/${courseId}`)
      .toPromise();
    
    if (!response?.data) {
      throw new Error('Course not found');
    }
    
    return response.data;
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    if (!currentSeasonId) {
      throw new Error('No season selected');
    }

    const coursePayload = {
      ...courseData,
      season_id: currentSeasonId
    };

    const response = await this.apiV5
      .post<ApiResponse<Course>>('courses', coursePayload)
      .toPromise();

    if (!response?.data) {
      throw new Error('Failed to create course');
    }

    // Refresh courses list
    await this.getCoursesBySeason(currentSeasonId);
    
    return response.data;
  }

  async updateCourse(courseId: number, courseData: Partial<Course>): Promise<Course> {
    const response = await this.apiV5
      .put<ApiResponse<Course>>(`courses/${courseId}`, courseData)
      .toPromise();

    if (!response?.data) {
      throw new Error('Failed to update course');
    }

    // Refresh courses list
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    if (currentSeasonId) {
      await this.getCoursesBySeason(currentSeasonId);
    }
    
    return response.data;
  }

  async deleteCourse(courseId: number): Promise<void> {
    await this.apiV5
      .delete(`courses/${courseId}`)
      .toPromise();

    // Refresh courses list
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    if (currentSeasonId) {
      await this.getCoursesBySeason(currentSeasonId);
    }
  }

  async duplicateCourseToSeason(courseId: number, targetSeasonId: number): Promise<Course> {
    const response = await this.apiV5
      .post<ApiResponse<Course>>(`courses/${courseId}/duplicate`, {
        target_season_id: targetSeasonId
      })
      .toPromise();

    if (!response?.data) {
      throw new Error('Failed to duplicate course');
    }

    return response.data;
  }

  async createCourseFromTemplate(templateId: number, seasonId?: number): Promise<Course> {
    const currentSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();
    if (!currentSeasonId) {
      throw new Error('No season selected');
    }

    const response = await this.apiV5
      .post<ApiResponse<Course>>(`course-templates/${templateId}/create-course`, {
        season_id: currentSeasonId
      })
      .toPromise();

    if (!response?.data) {
      throw new Error('Failed to create course from template');
    }

    // Refresh courses list
    await this.getCoursesBySeason(currentSeasonId);
    
    return response.data;
  }

  async getCourseTemplates(): Promise<CourseTemplate[]> {
    const response = await this.apiV5
      .get<ApiResponse<CourseTemplate[]>>('course-templates')
      .toPromise();
    
    return response?.data || [];
  }

  async getCourseGroups(): Promise<CourseGroup[]> {
    const response = await this.apiV5
      .get<ApiResponse<CourseGroup[]>>('course-groups')
      .toPromise();
    
    return response?.data || [];
  }

  async getCourseSubgroups(groupId: number): Promise<CourseSubgroup[]> {
    const response = await this.apiV5
      .get<ApiResponse<CourseSubgroup[]>>(`course-groups/${groupId}/subgroups`)
      .toPromise();
    
    return response?.data || [];
  }

  canEditCourse(course: Course): boolean {
    const currentSeason = this.seasonContext.getCurrentSeason();
    return !!(currentSeason && !currentSeason.is_closed && course.season_id === currentSeason.id);
  }

  getCurrentSeasonCourses(): Course[] {
    return this.coursesSubject.value;
  }

  clearCourses(): void {
    this.coursesSubject.next([]);
  }
}