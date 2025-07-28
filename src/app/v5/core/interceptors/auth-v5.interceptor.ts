import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthV5Service } from '../services/auth-v5.service';
import { SeasonContextService } from '../services/season-context.service';

@Injectable()
export class AuthV5Interceptor implements HttpInterceptor {
  constructor(private authService: AuthV5Service, private seasonContext: SeasonContextService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers = req.headers;
    const token = this.authService.getToken();
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (seasonId) {
      headers = headers.set('X-Season-Id', String(seasonId));
    }
    return next.handle(req.clone({ headers }));
  }
}
