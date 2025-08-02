import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// import { SharedModule } from '../../shared/shared.module'; // Comentado hasta implementar
import { TranslateModule } from '@ngx-translate/core';

// Angular Material básico
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatOptionModule } from '@angular/material/core';

import { SchoolsRoutingModule } from './schools-routing.module';
import { SchoolDashboardComponent } from './pages/school-dashboard/school-dashboard.component';
import { SchoolConfigurationComponent } from './pages/school-configuration/school-configuration.component';
import { SchoolModulesManagerComponent } from './pages/school-modules-manager/school-modules-manager.component';
import { SchoolSeasonSettingsComponent } from './pages/school-season-settings/school-season-settings.component';
import { SchoolInfoCardComponent } from './components/school-info-card/school-info-card.component';
import { ModuleToggleComponent } from './components/module-toggle/module-toggle.component';
import { SeasonSettingsFormComponent } from './components/season-settings-form/season-settings-form.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    SchoolDashboardComponent,
    SchoolConfigurationComponent,
    SchoolModulesManagerComponent,
    SchoolSeasonSettingsComponent,
    SchoolInfoCardComponent,
    ModuleToggleComponent,
    SeasonSettingsFormComponent
  ],
  imports: [
    CommonModule,
    SchoolsRoutingModule,
    ReactiveFormsModule,
    TranslateModule,

    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatExpansionModule,
    MatOptionModule,
    SharedModule,

    // SharedModule // Comentado hasta implementar
  ]
})
export class SchoolsModule { }
