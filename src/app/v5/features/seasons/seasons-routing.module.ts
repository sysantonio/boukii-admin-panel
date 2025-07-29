import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeasonListComponent } from './pages/season-list/season-list.component';
import { SeasonFormComponent } from './pages/season-form/season-form.component';
import { SeasonDetailComponent } from './pages/season-detail/season-detail.component';

const routes: Routes = [
  { path: '', component: SeasonListComponent },
  { path: 'new', component: SeasonFormComponent },
  { path: ':id', component: SeasonDetailComponent },
  { path: ':id/edit', component: SeasonFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeasonsRoutingModule { }
