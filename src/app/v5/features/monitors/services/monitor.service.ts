import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiV5Service, ApiV5Response } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { Monitor } from '../models/monitor.interface';

export interface CreateMonitorRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  document_type: string;
  document_number: string;
  nationality: string;
  employee_id: string;
  hire_date: string;
  contract_type: string;
  department: string;
  position: string;
  experience_level: string;
  years_of_experience: number;
}

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService
  ) {}

  getMonitors(): Observable<Monitor[]> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    const params = currentSeasonId ? { season_id: currentSeasonId } : undefined;

    return this.apiV5.get<ApiV5Response<Monitor[]>>('monitors', params).pipe(
      map(response => response.success ? response.data : []),
      tap(monitors => console.log(`[MonitorService] Loaded ${monitors.length} monitors`)),
      catchError(error => {
        console.error('[MonitorService] Error loading monitors:', error);
        throw error;
      })
    );
  }

  getMonitorById(id: number): Observable<Monitor> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    const params = currentSeasonId ? { season_id: currentSeasonId } : undefined;

    return this.apiV5.get<ApiV5Response<Monitor>>(`monitors/${id}`, params).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Monitor not found');
      }),
      tap(monitor => console.log(`[MonitorService] Loaded monitor:`, monitor)),
      catchError(error => {
        console.error('[MonitorService] Error loading monitor:', error);
        throw error;
      })
    );
  }

  createMonitor(monitorData: CreateMonitorRequest): Observable<Monitor> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    const payload = {
      ...monitorData,
      season_id: currentSeasonId
    };

    return this.apiV5.post<ApiV5Response<Monitor>>('monitors', payload).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to create monitor');
      }),
      tap(monitor => console.log(`[MonitorService] Created monitor:`, monitor)),
      catchError(error => {
        console.error('[MonitorService] Error creating monitor:', error);
        throw error;
      })
    );
  }

  updateMonitor(id: number, monitorData: Partial<Monitor>): Observable<Monitor> {
    return this.apiV5.put<ApiV5Response<Monitor>>(`monitors/${id}`, monitorData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to update monitor');
      }),
      tap(monitor => console.log(`[MonitorService] Updated monitor:`, monitor)),
      catchError(error => {
        console.error('[MonitorService] Error updating monitor:', error);
        throw error;
      })
    );
  }

  deleteMonitor(id: number): Observable<void> {
    return this.apiV5.delete<ApiV5Response<void>>(`monitors/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to delete monitor');
        }
      }),
      tap(() => console.log(`[MonitorService] Deleted monitor ${id}`)),
      catchError(error => {
        console.error('[MonitorService] Error deleting monitor:', error);
        throw error;
      })
    );
  }

  getAvailableMonitors(date?: string, timeSlot?: string): Observable<Monitor[]> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    const params: any = currentSeasonId ? { season_id: currentSeasonId } : {};
    
    if (date) params.date = date;
    if (timeSlot) params.time_slot = timeSlot;

    return this.apiV5.get<ApiV5Response<Monitor[]>>('monitors/available', params).pipe(
      map(response => response.success ? response.data : []),
      tap(monitors => console.log(`[MonitorService] Found ${monitors.length} available monitors`)),
      catchError(error => {
        console.error('[MonitorService] Error loading available monitors:', error);
        throw error;
      })
    );
  }

  updateMonitorStatus(id: number, status: string): Observable<Monitor> {
    return this.apiV5.patch<ApiV5Response<Monitor>>(`monitors/${id}/status`, { status }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to update monitor status');
      }),
      tap(monitor => console.log(`[MonitorService] Updated monitor status:`, monitor)),
      catchError(error => {
        console.error('[MonitorService] Error updating monitor status:', error);
        throw error;
      })
    );
  }
}