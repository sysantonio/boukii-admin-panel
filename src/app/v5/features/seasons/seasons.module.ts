import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Angular Material básico
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { SeasonsRoutingModule } from './seasons-routing.module';
import { SeasonListComponent } from './pages/season-list/season-list.component';
import { SeasonFormComponent } from './pages/season-form/season-form.component';
import { SeasonDetailComponent } from './pages/season-detail/season-detail.component';

// NgRx temporal - comentado hasta implementar
// import { StoreModule } from '@ngrx/store';
// import { EffectsModule } from '@ngrx/effects';
// import { seasonFeatureKey, seasonReducer } from './state/season.state';
// import { SeasonEffects } from './state/season.effects';

@NgModule({
  declarations: [
    SeasonListComponent,
    SeasonFormComponent,
    SeasonDetailComponent
  ],
  imports: [
    CommonModule,
    SeasonsRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatSelectModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
    MatCheckboxModule
    
    // NgRx temporal - comentado hasta implementar
    // StoreModule.forFeature(seasonFeatureKey, seasonReducer),
    // EffectsModule.forFeature([SeasonEffects]),
  ]
})
export class SeasonsModule { 

  constructor() {
    console.log('📅 Seasons Module V5 loaded (simplified)');
  }
}
