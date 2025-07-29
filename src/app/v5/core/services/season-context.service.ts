import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Season } from '../models/season.interface';
import { ApiV5Service } from './api-v5.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SeasonContextService {
  private currentSeasonSubject = new BehaviorSubject<Season | null>(null);
  private availableSeasonsSubject = new BehaviorSubject<Season[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  readonly currentSeason$ = this.currentSeasonSubject.asObservable();
  readonly availableSeasons$ = this.availableSeasonsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  constructor(private apiV5: ApiV5Service, private snackBar: MatSnackBar) {
    this.initializeSeasonContext();
  }

  setCurrentSeason(season: Season): void {
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
      const seasons = await this.apiV5
        .get<Season[]>('seasons/available')
        .toPromise();
      this.availableSeasonsSubject.next(seasons || []);
    } catch (error) {
      console.error('Error loading seasons:', error);
      this.availableSeasonsSubject.next([]);
    }
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
