import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeasonsRoutingModule } from './seasons-routing.module';
import { SeasonListComponent } from './pages/season-list/season-list.component';
import { SeasonFormComponent } from './pages/season-form/season-form.component';
import { SeasonDetailComponent } from './pages/season-detail/season-detail.component';


@NgModule({
  declarations: [
    SeasonListComponent,
    SeasonFormComponent,
    SeasonDetailComponent
  ],
  imports: [
    CommonModule,
    SeasonsRoutingModule
  ]
})
export class SeasonsModule { }
