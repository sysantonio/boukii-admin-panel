import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Season } from '../models/season.interface';
import { ApiV5Service } from './api-v5.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiV5Response } from '../models/api-response.interface';

@Injectable({ providedIn: 'root' })
export class SeasonContextService {
  private currentSeasonSubject = new BehaviorSubject<Season | null>(null);
  private availableSeasonsSubject = new BehaviorSubject<Season[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  readonly currentSeason$ = this.currentSeasonSubject.asObservable();
  readonly availableSeasons$ = this.availableSeasonsSubject.asObservable();
  readonly seasons$ = this.availableSeasonsSubject.asObservable(); // Alias for compatibility
  readonly loading$ = this.loadingSubject.asObservable();

  constructor(private apiV5: ApiV5Service, private snackBar: MatSnackBar) {
    this.initializeSeasonContext();
  }

  setCurrentSeason(seasonOrId: Season | number): void {
    let season: Season | undefined;
    
    if (typeof seasonOrId === 'number') {
      // Find season by ID
      season = this.availableSeasonsSubject.value.find(s => s.id === seasonOrId);
      if (!season) {
        console.error('Season not found with ID:', seasonOrId);
        return;
      }
    } else {
      season = seasonOrId;
    }

    const previousSeason = this.currentSeasonSubject.value;
    this.currentSeasonSubject.next(season);
    localStorage.setItem('boukii_current_season', JSON.stringify(season));
    window.dispatchEvent(
      new CustomEvent('boukii-season-changed', {
        detail: { previousSeason, currentSeason: season, timestamp: Date.now() },
      })
    );
    this.snackBar.open(`Temporada cambiada a: ${season.name}`, 'OK', {
      duration: 3000,
    });
  }

  getCurrentSeasonId(): number | null {
    return this.currentSeasonSubject.value?.id || null;
  }

  getCurrentSeason(): Season | null {
    return this.currentSeasonSubject.value;
  }

  canEditCurrentSeason(): boolean {
    const season = this.getCurrentSeason();
    return !!season && !season.is_closed && !season.is_historical;
  }

  clearCurrentSeason(): void {
    this.currentSeasonSubject.next(null);
    localStorage.removeItem('boukii_current_season');
    window.dispatchEvent(
      new CustomEvent('boukii-season-cleared', {
        detail: { timestamp: Date.now() },
      })
    );
  }

  setCurrentSeasonId(seasonId: number): void {
    this.setCurrentSeason(seasonId);
  }

  promptSeasonSelection(): void {
    this.snackBar.open('Seleccione una temporada', 'OK', { duration: 3000 });
  }

  private async initializeSeasonContext(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      await this.loadAvailableSeasons();
      await this.initializeCurrentSeason();
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async loadAvailableSeasons(): Promise<void> {
    try {
      const response = await this.apiV5
        .get<Season[]>('v5/seasons')
        .toPromise() as ApiV5Response<Season[]>;
      if (response && response.success) {
        this.availableSeasonsSubject.next(response.data || []);
      } else {
        this.createTestSeason();
      }
    } catch (error) {
      console.error('Error loading seasons:', error);
      this.createTestSeason();
    }
  }

  private createTestSeason(): void {
    const testSeason: Season = {
      id: 1,
      name: 'Temporada 2024-2025',
      year: 2025,
      start_date: '2024-12-01',
      end_date: '2025-04-30',
      is_active: true,
      is_closed: false,
      is_historical: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.availableSeasonsSubject.next([testSeason]);
  }

  private async initializeCurrentSeason(): Promise<void> {
    const stored = localStorage.getItem('boukii_current_season');
    if (stored) {
      try {
        const season = JSON.parse(stored);
        this.currentSeasonSubject.next(season);
        return;
      } catch {
        localStorage.removeItem('boukii_current_season');
      }
    }

    const seasons = this.availableSeasonsSubject.value;
    const activeSeason = seasons.find((s) => s.is_active);
    if (activeSeason) {
      this.setCurrentSeason(activeSeason);
    } else if (seasons.length > 0) {
      const mostRecent = [...seasons].sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )[0];
      this.setCurrentSeason(mostRecent);
    }
  }
}
