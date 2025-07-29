import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { V5LayoutComponent } from './layout/v5-layout.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { AuthV5Guard } from './core/guards/auth-v5.guard';
import { SeasonContextGuard } from './core/guards/season-context.guard';

const routes: Routes = [
  {
    path: '',
    component: V5LayoutComponent,
    canActivate: [AuthV5Guard],
    children: [
      { path: '', component: WelcomeComponent },
      {
        path: 'seasons',
        loadChildren: () =>
          import('./features/seasons/seasons.module').then(m => m.SeasonsModule)
      },
      {
        path: 'schools',
        canActivate: [SeasonContextGuard],
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
