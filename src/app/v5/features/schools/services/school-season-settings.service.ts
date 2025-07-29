import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchoolSeasonSettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/school-season-settings`;

  constructor() {}

  getSettings(schoolId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?school_id=${schoolId}`);
  }

  updateSettings(id: number, data: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }
}
