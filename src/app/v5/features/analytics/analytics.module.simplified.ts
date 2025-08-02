import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// Angular Material básico
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Solo componentes que existen
import { AnalyticsDashboardSeasonComponent } from './components/analytics-dashboard-season/analytics-dashboard-season.component';

// Solo servicios que existen
import { AnalyticsSeasonService } from './services/analytics-season.service';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
  declarations: [
    // Solo componentes que realmente existen
    AnalyticsDashboardSeasonComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AnalyticsDashboardSeasonComponent,
        data: {
          title: 'Analytics Dashboard',
          breadcrumb: 'Analytics'
        }
      }
    ]),

    // Angular Material básico
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    TranslateModule,
    MatSlideToggleModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatTooltipModule,
    MatMenuModule
  ],
  providers: [
    // Solo servicios que existen
    AnalyticsSeasonService
  ],
  exports: [
    AnalyticsDashboardSeasonComponent
  ]
})
export class AnalyticsModule {

  constructor() {
    console.log('📊 Analytics Module V5 loaded (simplified)');
  }
}
