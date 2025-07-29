import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SeasonContextService } from './season-context.service';
import { Season } from '../models/season.interface';

export interface LoginResponse {
  token: string;
  user: any;
  active_season?: Season;
}

@Injectable({ providedIn: 'root' })
export class AuthV5Service {
  private tokenKey = 'boukiiUserToken';
  private userKey = 'boukiiUser';

  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem(this.tokenKey)
  );
  readonly token$ = this.tokenSubject.asObservable();

  private userSubject = new BehaviorSubject<any | null>(this.getStoredUser());
  readonly user$ = this.userSubject.asObservable();

  readonly isAuthenticated$ = this.token$.pipe(map((t) => !!t));

  constructor(
    private http: HttpClient,
    private seasonContext: SeasonContextService
  ) {}

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.baseUrl}/admin_v3/login`, credentials)
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          this.tokenSubject.next(res.token);

          if (res.user) {
            localStorage.setItem(this.userKey, JSON.stringify(res.user));
            this.userSubject.next(res.user);
          }

          if (res.active_season) {
            this.seasonContext.setCurrentSeason(res.active_season);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  hasPermission(permission: string): boolean {
    const user = this.userSubject.value as any;
    return Array.isArray(user?.permissions) && user.permissions.includes(permission);
  }

  private getStoredUser(): any | null {
    const stored = localStorage.getItem(this.userKey);
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
