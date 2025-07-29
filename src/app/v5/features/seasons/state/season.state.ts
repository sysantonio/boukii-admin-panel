import { createReducer, on } from '@ngrx/store';
import { Season } from '../../../core/models/season.interface';
import * as SeasonActions from './season.actions';

export const seasonFeatureKey = 'season';

export interface SeasonState {
  currentSeason: Season | null;
  seasons: Season[];
  loading: boolean;
  error: any;
}

export const initialState: SeasonState = {
  currentSeason: null,
  seasons: [],
  loading: false,
  error: null
};

export const seasonReducer = createReducer(
  initialState,
  on(SeasonActions.loadSeasons, state => ({ ...state, loading: true })),
  on(SeasonActions.loadSeasonsSuccess, (state, { seasons }) => ({
    ...state,
    seasons,
    loading: false,
    error: null
  })),
  on(SeasonActions.loadSeasonsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(SeasonActions.setCurrentSeason, (state, { season }) => ({
    ...state,
    currentSeason: season
  }))
);
