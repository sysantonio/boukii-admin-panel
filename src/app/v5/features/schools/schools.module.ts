import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { SchoolsRoutingModule } from './schools-routing.module';
import { SchoolDashboardComponent } from './pages/school-dashboard/school-dashboard.component';
import { SchoolConfigurationComponent } from './pages/school-configuration/school-configuration.component';
import { SchoolModulesManagerComponent } from './pages/school-modules-manager/school-modules-manager.component';
import { SchoolSeasonSettingsComponent } from './pages/school-season-settings/school-season-settings.component';
import { SchoolInfoCardComponent } from './components/school-info-card/school-info-card.component';
import { ModuleToggleComponent } from './components/module-toggle/module-toggle.component';
import { SeasonSettingsFormComponent } from './components/season-settings-form/season-settings-form.component';

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
    SharedModule
  ]
})
export class SchoolsModule { }
