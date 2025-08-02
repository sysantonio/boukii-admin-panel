import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { LoggingService } from './logging.service';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
  version: string;
  metadata?: any;
}

export interface CacheConfig {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  versioning?: boolean; // Enable cache versioning
  persistToStorage?: boolean; // Persist to localStorage
  storagePrefix?: string;
}

export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private config: Required<CacheConfig> = {
    ttl: 5 * 60 * 1000, // 5 minutes default
    maxSize: 1000,
    versioning: true,
    persistToStorage: true,
    storagePrefix: 'boukii_cache_'
  };

  private stats = {
    hitCount: 0,
    missCount: 0
  };

  private onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$ = this.onlineStatusSubject.asObservable();

  constructor(private logger: LoggingService) {
    this.initializeCache();
    this.setupOnlineStatusListener();
    this.setupPeriodicCleanup();
  }

  private initializeCache(): void {
    if (this.config.persistToStorage && this.isStorageAvailable()) {
      this.loadFromStorage();
    }

    // Log cache initialization
    this.logger.info('Cache service initialized', {
      config: this.config,
      persistedEntries: this.cache.size
    });
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => {
      this.onlineStatusSubject.next(true);
      this.logger.info('Application is online');
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.onlineStatusSubject.next(false);
      this.logger.warn('Application is offline');
    });
  }

  private setupPeriodicCleanup(): void {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.cleanExpiredEntries();
    }, 5 * 60 * 1000);
  }

  // ==================== CACHE OPERATIONS ====================

  set<T>(key: string, data: T, ttl?: number, metadata?: any): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      key,
      version: this.config.versioning ? this.generateVersion() : '1.0',
      metadata
    };

    try {
      // Check cache size limit
      if (this.cache.size >= this.config.maxSize) {
        this.evictOldestEntry();
      }

      this.cache.set(key, entry);

      if (this.config.persistToStorage) {
        this.persistToStorage(key, entry);
      }

      this.logger.debug('Cache entry set', { key, ttl: entry.ttl });
    } catch (error) {
      this.logger.error('Failed to set cache entry', { key, error });
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;

    if (!entry) {
      this.stats.missCount++;
      this.logger.debug('Cache miss', { key });
      return null;
    }

    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.missCount++;
      this.logger.debug('Cache entry expired', { key });
      return null;
    }

    this.stats.hitCount++;
    this.logger.debug('Cache hit', { key });
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted && this.config.persistToStorage) {
      this.removeFromStorage(key);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    if (this.config.persistToStorage) {
      this.clearStorage();
    }
    this.stats.hitCount = 0;
    this.stats.missCount = 0;
    this.logger.info('Cache cleared');
  }

  // ==================== HTTP CACHE OPERATIONS ====================

  setHttpResponse(key: string, response: HttpResponse<any>, ttl?: number): void {
    const cacheData = {
      body: response.body,
      headers: this.serializeHeaders(response.headers),
      status: response.status,
      statusText: response.statusText,
      url: response.url
    };

    this.set(key, cacheData, ttl, { type: 'http_response' });
  }

  getHttpResponse<T>(key: string): HttpResponse<T> | null {
    const cacheData = this.get<any>(key);
    if (!cacheData || cacheData.type !== 'http_response') {
      return null;
    }

    return new HttpResponse<T>({
      body: cacheData.body,
      headers: this.deserializeHeaders(cacheData.headers),
      status: cacheData.status,
      statusText: cacheData.statusText,
      url: cacheData.url
    });
  }

  // ==================== OFFLINE SUPPORT ====================

  isOnline(): boolean {
    return this.onlineStatusSubject.value;
  }

  cacheForOffline<T>(key: string, data: T, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    const ttl = this.getOfflineTTL(priority);
    this.set(key, data, ttl, { 
      offline: true, 
      priority,
      cachedAt: new Date().toISOString()
    });
  }

  getOfflineData<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;
    if (entry && entry.metadata?.offline) {
      return entry.data;
    }
    return null;
  }

  private getOfflineTTL(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 24 * 60 * 60 * 1000; // 24 hours
      case 'medium': return 12 * 60 * 60 * 1000; // 12 hours  
      case 'low': return 6 * 60 * 60 * 1000; // 6 hours
      default: return this.config.ttl;
    }
  }

  private syncPendingOperations(): void {
    // Implementation for syncing operations when back online
    this.logger.info('Syncing pending operations...');
    // This would typically sync with a separate offline queue service
  }

  // ==================== CACHE MANAGEMENT ====================

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanExpiredEntries(): void {
    let cleanedCount = 0;
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (this.isExpired(entry)) {
        this.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info('Cleaned expired cache entries', { count: cleanedCount });
    }
  }

  private evictOldestEntry(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.logger.debug('Evicted oldest cache entry', { key: oldestKey });
    }
  }

  // ==================== PERSISTENCE ====================

  private isStorageAvailable(): boolean {
    try {
      const test = 'cache_test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private persistToStorage(key: string, entry: CacheEntry): void {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      this.logger.warn('Failed to persist cache entry to storage', { key, error });
    }
  }

  private loadFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.config.storagePrefix)
      );

      for (const storageKey of keys) {
        try {
          const entryData = localStorage.getItem(storageKey);
          if (entryData) {
            const entry: CacheEntry = JSON.parse(entryData);
            const cacheKey = storageKey.substring(this.config.storagePrefix.length);
            
            if (!this.isExpired(entry)) {
              this.cache.set(cacheKey, entry);
            } else {
              localStorage.removeItem(storageKey);
            }
          }
        } catch (error) {
          this.logger.warn('Failed to load cache entry from storage', { storageKey, error });
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      this.logger.error('Failed to load cache from storage', error);
    }
  }

  private removeFromStorage(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      this.logger.warn('Failed to remove cache entry from storage', { key, error });
    }
  }

  private clearStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.config.storagePrefix)
      );
      
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      this.logger.error('Failed to clear cache storage', error);
    }
  }

  private getStorageKey(key: string): string {
    return `${this.config.storagePrefix}${key}`;
  }

  // ==================== UTILITIES ====================

  private generateVersion(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private serializeHeaders(headers: any): { [key: string]: string } {
    const serialized: { [key: string]: string } = {};
    if (headers && typeof headers.keys === 'function') {
      for (const key of headers.keys()) {
        serialized[key] = headers.get(key);
      }
    }
    return serialized;
  }

  private deserializeHeaders(serialized: { [key: string]: string }): any {
    // This would need to be adapted based on Angular's HttpHeaders implementation
    return serialized;
  }

  // ==================== STATISTICS & MONITORING ====================

  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.stats.hitCount + this.stats.missCount;
    
    let memoryUsage = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    for (const entry of entries) {
      // Rough memory usage calculation
      memoryUsage += JSON.stringify(entry).length * 2; // chars * 2 bytes
      
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
      
      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }
    }

    return {
      totalEntries: this.cache.size,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
      hitRate: totalRequests > 0 ? (this.stats.hitCount / totalRequests) * 100 : 0,
      memoryUsage,
      oldestEntry: entries.length > 0 ? new Date(oldestTimestamp) : undefined,
      newestEntry: entries.length > 0 ? new Date(newestTimestamp) : undefined
    };
  }

  exportCache(): string {
    const exportData = {
      config: this.config,
      stats: this.getStats(),
      entries: Array.from(this.cache.entries()),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Cache configuration updated', { config: this.config });
  }

  // ==================== SPECIFIC CACHE STRATEGIES ====================

  // Cache with refresh-ahead strategy
  setWithRefreshAhead<T>(
    key: string, 
    data: T, 
    ttl: number, 
    refreshFunction: () => Observable<T>
  ): void {
    this.set(key, data, ttl);
    
    // Set up refresh before expiration (at 80% of TTL)
    const refreshTime = ttl * 0.8;
    setTimeout(() => {
      refreshFunction().subscribe({
        next: (newData) => {
          this.set(key, newData, ttl);
          this.logger.debug('Cache entry refreshed proactively', { key });
        },
        error: (error) => {
          this.logger.warn('Failed to refresh cache entry', { key, error });
        }
      });
    }, refreshTime);
  }

  // Cache with write-through strategy
  setWriteThrough<T>(
    key: string, 
    data: T, 
    writeFunction: (data: T) => Observable<T>
  ): Observable<T> {
    return new Observable(observer => {
      writeFunction(data).subscribe({
        next: (result) => {
          this.set(key, result);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}