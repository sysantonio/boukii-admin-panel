import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';

// Solo componentes que existen
import { MonitorAvailabilityMatrixComponent } from './components/monitor-availability-matrix/monitor-availability-matrix.component';

// Solo servicios que existen
import { MonitorSeasonService } from './services/monitor-season.service';
import { MonitorAvailabilityService } from './services/monitor-availability.service';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@NgModule({
  declarations: [
    // Solo componentes que realmente existen
    MonitorAvailabilityMatrixComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: MonitorAvailabilityMatrixComponent,
        data: {
          title: 'Monitors',
          breadcrumb: 'Monitors'
        }
      }
    ]),

    // Angular Material básico
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    TranslateModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatButtonToggleModule
  ],
  providers: [
    // Solo servicios que existen
    MonitorSeasonService,
    MonitorAvailabilityService
  ],
  exports: [
    MonitorAvailabilityMatrixComponent
  ]
})
export class MonitorsModule {

  constructor() {
    console.log('👨‍🏫 Monitors Module V5 loaded (simplified)');
  }
}
