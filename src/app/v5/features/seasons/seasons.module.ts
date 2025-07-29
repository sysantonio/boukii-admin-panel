import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeasonsRoutingModule } from './seasons-routing.module';
import { SeasonListComponent } from './pages/season-list/season-list.component';
import { SeasonFormComponent } from './pages/season-form/season-form.component';
import { SeasonDetailComponent } from './pages/season-detail/season-detail.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { seasonFeatureKey, seasonReducer } from './state/season.state';
import { SeasonEffects } from './state/season.effects';


@NgModule({
  declarations: [
    SeasonListComponent,
    SeasonFormComponent,
    SeasonDetailComponent
  ],
  imports: [
    CommonModule,
    SeasonsRoutingModule,
    StoreModule.forFeature(seasonFeatureKey, seasonReducer),
    EffectsModule.forFeature([SeasonEffects])
  ]
})
export class SeasonsModule { }
