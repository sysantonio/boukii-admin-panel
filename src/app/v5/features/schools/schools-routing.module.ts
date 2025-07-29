import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolDashboardComponent } from './pages/school-dashboard/school-dashboard.component';
import { SchoolConfigurationComponent } from './pages/school-configuration/school-configuration.component';
import { SchoolModulesManagerComponent } from './pages/school-modules-manager/school-modules-manager.component';
import { SchoolSeasonSettingsComponent } from './pages/school-season-settings/school-season-settings.component';

const routes: Routes = [
  { path: '', component: SchoolDashboardComponent },
  { path: 'configuration', component: SchoolConfigurationComponent },
  { path: 'modules', component: SchoolModulesManagerComponent },
  { path: 'season-settings', component: SchoolSeasonSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolsRoutingModule { }
