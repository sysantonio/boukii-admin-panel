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
    // canActivate: [AuthV5Guard], // Comentado temporalmente para desarrollo
    children: [
      { path: '', component: WelcomeComponent },
      {
        path: 'seasons',
        loadChildren: () =>
          import('./features/seasons/seasons.module').then(m => m.SeasonsModule)
      },
      {
        path: 'courses',
        loadChildren: () =>
          import('./features/courses/courses.module').then(m => m.CoursesModule)
      },
      {
        path: 'schools',
        // canActivate: [SeasonContextGuard], // Comentado temporalmente para desarrollo
        loadChildren: () =>
          import('./features/schools/schools.module').then(m => m.SchoolsModule)
      },
      {
        path: 'bookings',
        // canActivate: [SeasonContextGuard], // Comentado temporalmente para desarrollo
        loadChildren: () =>
          import('./features/reservations/reservations.module').then(m => m.ReservationsModule)
      },
      {
        path: 'clients',
        // canActivate: [SeasonContextGuard], // Comentado temporalmente para desarrollo
        loadChildren: () =>
          import('./features/clients/clients.module').then(m => m.ClientsModule)
      },
      {
        path: 'monitors',
        // canActivate: [SeasonContextGuard], // Comentado temporalmente para desarrollo
        loadChildren: () =>
          import('./features/monitors/monitors.module').then(m => m.MonitorsModule)
      },
      {
        path: 'analytics',
        // canActivate: [SeasonContextGuard], // Comentado temporalmente para desarrollo
        loadChildren: () =>
          import('./features/analytics/analytics.module').then(m => m.AnalyticsModule)
      },
      {
        path: 'reservations',
        redirectTo: 'bookings'
      },
      {
        path: 'planner',
        loadChildren: () =>
          import('./features/planner/planner.module').then(m => m.PlannerModule)
      },
      {
        path: 'equipment',
        loadChildren: () =>
          import('./features/equipment/equipment.module').then(m => m.EquipmentModule)
      },
      {
        path: 'bonuses',
        loadChildren: () =>
          import('./features/bonuses/bonuses.module').then(m => m.BonusesModule)
      },
      {
        path: 'communications',
        loadChildren: () =>
          import('./features/communications/communications.module').then(m => m.CommunicationsModule)
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/payments/payments.module').then(m => m.PaymentsModule)
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'admins',
        loadChildren: () =>
          import('./features/admins/admins.module').then(m => m.AdminsModule)
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.module').then(m => m.SettingsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class V5RoutingModule {}
