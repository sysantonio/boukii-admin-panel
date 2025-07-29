import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { V5LayoutComponent } from './layout/v5-layout.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';

const routes: Routes = [
  {
    path: '',
    component: V5LayoutComponent,
    children: [
      { path: '', component: WelcomeComponent },
      {
        path: 'seasons',
        loadChildren: () =>
          import('./features/seasons/seasons.module').then(m => m.SeasonsModule)
      },
      {
        path: 'schools',
        loadChildren: () =>
          import('./features/schools/schools.module').then(m => m.SchoolsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class V5RoutingModule {}
