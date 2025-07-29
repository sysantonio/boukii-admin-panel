import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Season } from '../../../core/models/season.interface';

@Injectable({
  providedIn: 'root'
})
export class SeasonService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/seasons`;

  constructor() {}

  getSeasons(): Observable<Season[]> {
    return this.http.get<Season[]>(this.apiUrl);
  }

  getSeason(id: number): Observable<Season> {
    return this.http.get<Season>(`${this.apiUrl}/${id}`);
  }

  createSeason(season: Partial<Season>): Observable<Season> {
    return this.http.post<Season>(this.apiUrl, season);
  }

  updateSeason(id: number, season: Partial<Season>): Observable<Season> {
    return this.http.put<Season>(`${this.apiUrl}/${id}`, season);
  }

  deleteSeason(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
