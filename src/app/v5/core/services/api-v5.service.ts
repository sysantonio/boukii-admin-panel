import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SeasonContextService } from './season-context.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ApiV5Service {
  private baseUrlV5 = `${environment.baseUrl}/admin_v3`;

  constructor(
    private http: HttpClient,
    private seasonContext: SeasonContextService,
    private notification: NotificationService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('boukiiUserToken');
    const seasonId = this.seasonContext.getCurrentSeasonId();

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (seasonId !== null) {
      headers = headers.set('X-Season-Id', String(seasonId));
    }
    return headers.set('X-Client-Version', 'boukii-admin-v5.0');
  }

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrlV5}/${endpoint}`, {
        headers: this.getHeaders(),
        params: this.addSeasonParam(params),
      })
      .pipe(catchError((e) => this.handleError(e)), shareReplay(1));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const enrichedBody = {
      ...body,
      season_id: this.seasonContext.getCurrentSeasonId(),
    };

    return this.http
      .post<T>(`${this.baseUrlV5}/${endpoint}`, enrichedBody, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((e) => this.handleError(e)));
  }

  private addSeasonParam(params?: HttpParams): HttpParams {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!params) {
      params = new HttpParams();
    }
    if (seasonId !== null) {
      params = params.set('season_id', seasonId.toString());
    }
    return params;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 422 && (error as any).error?.season_required) {
      this.seasonContext.promptSeasonSelection();
    }
    this.notification.error('Error al comunicarse con el servidor');
    return throwError(() => error);
  }
}
