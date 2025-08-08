import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiV5Service, ApiV5Response } from '../../../core/services/api-v5.service';

export interface SchoolSeasonSettings {
  id: number;
  school_id: number;
  season_id: number;
  settings: any;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchoolSeasonSettingsService {
  constructor(private apiV5: ApiV5Service) {}

  getSettings(schoolId: number): Observable<SchoolSeasonSettings[]> {
    return this.apiV5.get<ApiV5Response<SchoolSeasonSettings[]>>(`school-season-settings?school_id=${schoolId}`).pipe(
      map(response => response.success ? response.data : []),
      tap(settings => console.log(`[SchoolSeasonSettingsService] Loaded ${settings.length} settings for school ${schoolId}`)),
      catchError(error => {
        console.error('[SchoolSeasonSettingsService] Error loading settings:', error);
        throw error;
      })
    );
  }

  updateSettings(id: number, data: Partial<SchoolSeasonSettings>): Observable<SchoolSeasonSettings> {
    return this.apiV5.put<ApiV5Response<SchoolSeasonSettings>>(`school-season-settings/${id}`, data).pipe(
      map(response => response.success ? response.data : {} as SchoolSeasonSettings),
      tap(settings => console.log(`[SchoolSeasonSettingsService] Updated settings:`, settings)),
      catchError(error => {
        console.error('[SchoolSeasonSettingsService] Error updating settings:', error);
        throw error;
      })
    );
  }
}
