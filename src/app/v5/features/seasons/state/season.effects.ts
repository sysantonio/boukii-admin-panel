import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as SeasonActions from './season.actions';
import { SeasonService } from '../services/season.service';
import {SeasonContextService} from '../../../core/services/season-context.service';

@Injectable()
export class SeasonEffects {
  loadSeasons$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SeasonActions.loadSeasons),
      switchMap(() =>
        this.seasonService.getSeasons().pipe(
          map(seasons => SeasonActions.loadSeasonsSuccess({ seasons })),
          catchError(error => of(SeasonActions.loadSeasonsFailure({ error })))
        )
      )
    )
  );

  setCurrentSeason$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SeasonActions.setCurrentSeason),
        tap(action => this.seasonContext.setCurrentSeason(action.season))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private seasonService: SeasonService,
    private seasonContext: SeasonContextService
  ) {}
}
