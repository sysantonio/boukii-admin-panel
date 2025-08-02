import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cachableUrlPatterns = [
    /\/api\/v5\/seasons$/,
    /\/api\/v5\/course-groups$/,
    /\/api\/v5\/course-templates$/,
    /\/api\/v5\/clients\/\d+$/,
    /\/api\/v5\/monitors\/\d+$/,
    /\/api\/v5\/schools\/\d+$/
  ];

  private cacheExclusions = [
    /\/auth\//,
    /\/login/,
    /\/logout/,
    /\/password/,
    /\/booking.*\/payment/,
    /\/reports/,
    /\/analytics/
  ];

  constructor(
    private cache: CacheService,
    private logger: LoggingService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return this.handleNonCachableRequest(request, next);
    }

    // Check if request is cachable
    if (!this.isCachable(request)) {
      return next.handle(request);
    }

    const cacheKey = this.generateCacheKey(request);
    
    // Check if we're offline and have cached data
    if (!this.cache.isOnline()) {
      return this.handleOfflineRequest(request, next, cacheKey);
    }

    // Check for cached response
    const cachedResponse = this.cache.getHttpResponse(cacheKey);
    if (cachedResponse) {
      this.logger.debug('Serving from cache', { 
        url: request.url, 
        cacheKey,
        method: request.method 
      });
      return of(cachedResponse);
    }

    // Make request and cache response
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status === 200) {
          const ttl = this.getTTL(request);
          this.cache.setHttpResponse(cacheKey, event, ttl);
          
          // Also cache for offline use with high priority for critical data
          if (this.isCriticalData(request)) {
            this.cache.cacheForOffline(cacheKey, event.body, 'high');
          }
          
          this.logger.debug('Response cached', { 
            url: request.url, 
            cacheKey,
            ttl,
            size: JSON.stringify(event.body).length 
          });
        }
      })
    );
  }

  private handleNonCachableRequest(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // For non-GET requests, invalidate related cache entries
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      this.invalidateRelatedCache(request);
    }

    return next.handle(request);
  }

  private handleOfflineRequest(
    request: HttpRequest<unknown>, 
    next: HttpHandler, 
    cacheKey: string
  ): Observable<HttpEvent<unknown>> {
    // Try to get cached response first
    const cachedResponse = this.cache.getHttpResponse(cacheKey);
    if (cachedResponse) {
      this.logger.info('Serving cached data while offline', { 
        url: request.url, 
        cacheKey 
      });
      return of(cachedResponse);
    }

    // Try to get offline data
    const offlineData = this.cache.getOfflineData(cacheKey);
    if (offlineData) {
      this.logger.info('Serving offline data', { 
        url: request.url, 
        cacheKey 
      });
      
      const offlineResponse = new HttpResponse({
        body: offlineData,
        status: 200,
        statusText: 'OK (Offline)',
        url: request.url,
        headers: request.headers.set('X-Served-From', 'offline-cache')
      });
      
      return of(offlineResponse);
    }

    // No cached data available - let the request fail
    this.logger.warn('No cached data available for offline request', { 
      url: request.url 
    });
    
    return next.handle(request);
  }

  private isCachable(request: HttpRequest<any>): boolean {
    // Check exclusions first
    if (this.cacheExclusions.some(pattern => pattern.test(request.url))) {
      return false;
    }

    // Check if URL matches cachable patterns
    if (this.cachableUrlPatterns.some(pattern => pattern.test(request.url))) {
      return true;
    }

    // Check for cache headers
    const cacheControl = request.headers.get('Cache-Control');
    if (cacheControl && cacheControl.includes('no-cache')) {
      return false;
    }

    // Cache if explicitly requested
    const xCachable = request.headers.get('X-Cachable');
    if (xCachable === 'true') {
      return true;
    }

    return false;
  }

  private isCriticalData(request: HttpRequest<any>): boolean {
    const criticalPatterns = [
      /\/seasons$/,
      /\/schools\/\d+$/,
      /\/course-groups$/,
      /\/user-profile$/
    ];

    return criticalPatterns.some(pattern => pattern.test(request.url));
  }

  private generateCacheKey(request: HttpRequest<any>): string {
    // Include important parameters in cache key
    const url = request.urlWithParams;
    const method = request.method;
    
    // Include user context if available
    const userId = this.getUserId(request);
    const seasonId = this.getSeasonId(request);
    
    const keyParts = [method, url];
    
    if (userId) keyParts.push(`user:${userId}`);
    if (seasonId) keyParts.push(`season:${seasonId}`);
    
    return keyParts.join('|');
  }

  private getTTL(request: HttpRequest<any>): number {
    // Check for custom TTL header
    const customTTL = request.headers.get('X-Cache-TTL');
    if (customTTL) {
      return parseInt(customTTL, 10) * 1000; // Convert seconds to milliseconds
    }

    // Default TTL based on URL pattern
    if (/\/seasons$/.test(request.url)) {
      return 10 * 60 * 1000; // 10 minutes for seasons
    }
    
    if (/\/course-groups$/.test(request.url)) {
      return 15 * 60 * 1000; // 15 minutes for course groups
    }
    
    if (/\/clients\/\d+$/.test(request.url)) {
      return 5 * 60 * 1000; // 5 minutes for client details
    }
    
    if (/\/monitors\/\d+$/.test(request.url)) {
      return 5 * 60 * 1000; // 5 minutes for monitor details
    }

    // Default TTL
    return 3 * 60 * 1000; // 3 minutes
  }

  private invalidateRelatedCache(request: HttpRequest<any>): void {
    const url = request.url;
    
    // Define cache invalidation rules
    const invalidationRules = [
      {
        pattern: /\/seasons/,
        invalidate: ['GET|/api/v5/seasons', 'GET|/api/v5/seasons/available']
      },
      {
        pattern: /\/courses/,
        invalidate: [
          'GET|/api/v5/seasons/*/courses',
          'GET|/api/v5/course-groups',
          'GET|/api/v5/course-templates'
        ]
      },
      {
        pattern: /\/clients/,
        invalidate: ['GET|/api/v5/clients/*']
      },
      {
        pattern: /\/monitors/,
        invalidate: ['GET|/api/v5/monitors/*']
      }
    ];

    for (const rule of invalidationRules) {
      if (rule.pattern.test(url)) {
        for (const pattern of rule.invalidate) {
          this.invalidateCachePattern(pattern);
        }
      }
    }
  }

  private invalidateCachePattern(pattern: string): void {
    // Get all cache keys and invalidate matching ones
    const stats = this.cache.getStats();
    this.logger.debug('Invalidating cache pattern', { 
      pattern, 
      totalEntries: stats.totalEntries 
    });

    // This is a simplified implementation
    // In a real scenario, you'd need to iterate through cache keys
    // and match against the pattern, then delete matching entries
  }

  private getUserId(request: HttpRequest<any>): string | null {
    // Extract user ID from authorization header or request
    const auth = request.headers.get('Authorization');
    if (auth) {
      // Parse JWT token to extract user ID
      try {
        const token = auth.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.user_id;
      } catch {
        // Token parsing failed
      }
    }
    return null;
  }

  private getSeasonId(request: HttpRequest<any>): string | null {
    // Extract season ID from headers or URL params
    const seasonHeader = request.headers.get('X-Season-Id');
    if (seasonHeader) {
      return seasonHeader;
    }

    // Try to extract from URL params
    const seasonParam = request.params.get('season_id');
    if (seasonParam) {
      return seasonParam;
    }

    return null;
  }
}