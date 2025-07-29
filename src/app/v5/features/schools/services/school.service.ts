import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/schools`;

  constructor() {}

  getSchools(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSchool(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createSchool(data: Partial<any>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateSchool(id: number, data: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteSchool(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
