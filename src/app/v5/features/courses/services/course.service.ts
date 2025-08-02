import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interfaces
export interface CourseGroup {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  getCourseGroups(): Observable<CourseGroup[]> {
    // Mock data
    const mockCourseGroups: CourseGroup[] = [
      {
        id: 1,
        name: 'Iniciación Surf - Mañana',
        description: 'Curso básico de surf para principiantes'
      },
      {
        id: 2,
        name: 'Surf Intermedio - Tarde',
        description: 'Curso de surf nivel intermedio'
      }
    ];

    return of(mockCourseGroups).pipe(delay(300));
  }
}