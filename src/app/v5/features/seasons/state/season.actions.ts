import { createAction, props } from '@ngrx/store';
import { Season } from '../../../core/models/season.interface';

export const loadSeasons = createAction('[Season] Load Seasons');

export const loadSeasonsSuccess = createAction(
  '[Season] Load Seasons Success',
  props<{ seasons: Season[] }>()
);

export const loadSeasonsFailure = createAction(
  '[Season] Load Seasons Failure',
  props<{ error: any }>()
);

export const setCurrentSeason = createAction(
  '[Season] Set Current Season',
  props<{ season: Season }>()
);
