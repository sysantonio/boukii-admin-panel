import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Season } from '../models/season.interface';

@Injectable({ providedIn: 'root' })
export class SeasonContextService {
  private currentSeasonSubject = new BehaviorSubject<Season | null>(null);
  readonly currentSeason$ = this.currentSeasonSubject.asObservable();

  constructor() {}

  setCurrentSeason(season: Season): void {
    this.currentSeasonSubject.next(season);
    window.dispatchEvent(
      new CustomEvent('boukii-season-changed', { detail: { season } })
    );
  }

  getCurrentSeasonId(): number | null {
    return this.currentSeasonSubject.value?.id || null;
  }
}
