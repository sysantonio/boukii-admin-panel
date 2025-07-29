import { createFeatureSelector, createSelector } from '@ngrx/store';
import { seasonFeatureKey, SeasonState } from './season.state';

export const selectSeasonState = createFeatureSelector<SeasonState>(seasonFeatureKey);

export const selectCurrentSeason = createSelector(
  selectSeasonState,
  state => state.currentSeason
);

export const selectAllSeasons = createSelector(
  selectSeasonState,
  state => state.seasons
);

export const selectSeasonsLoading = createSelector(
  selectSeasonState,
  state => state.loading
);
