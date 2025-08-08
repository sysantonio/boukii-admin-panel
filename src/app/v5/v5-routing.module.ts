import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { V5LayoutComponent } from './layout/v5-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthV5Guard } from './core/guards/auth-v5.guard';
import { SeasonContextGuard } from './core/guards/season-context.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: V5LayoutComponent,
    canActivate: [AuthV5Guard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'welcome', redirectTo: 'dashboard', pathMatch: 'full' }, // Legacy redirect
      {
        path: 'seasons',
        canActivate: [AuthV5Guard], // Nivel 3: Contexto de escuela
        loadChildren: () =>
          import('./features/seasons/seasons.module').then(m => m.SeasonsModule)
      },
      {
        path: 'courses',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/courses/courses.module').then(m => m.CoursesModule)
      },
      {
        path: 'schools',
        canActivate: [AuthV5Guard], // Nivel 3: Contexto de escuela
        loadChildren: () =>
          import('./features/schools/schools.module').then(m => m.SchoolsModule)
      },
      {
        path: 'bookings',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/bookings/bookings.module').then(m => m.BookingsModule)
      },
      {
        path: 'clients',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/clients/clients.module').then(m => m.ClientsModule)
      },
      {
        path: 'monitors',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/monitors/monitors.module').then(m => m.MonitorsModule)
      },
      {
        path: 'analytics',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/analytics/analytics.module').then(m => m.AnalyticsModule)
      },
      {
        path: 'reservations',
        redirectTo: 'bookings', 
        pathMatch: 'full'
      },
      {
        path: 'planner',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/planner/planner.module').then(m => m.PlannerModule)
      },
      {
        path: 'equipment',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/equipment/equipment.module').then(m => m.EquipmentModule)
      },
      {
        path: 'bonuses',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/bonuses/bonuses.module').then(m => m.BonusesModule)
      },
      {
        path: 'communications',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/communications/communications.module').then(m => m.CommunicationsModule)
      },
      {
        path: 'payments',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/payments/payments.module').then(m => m.PaymentsModule)
      },
      {
        path: 'reports',
        canActivate: [AuthV5Guard, SeasonContextGuard], // Nivel 4: Contexto de escuela + temporada
        loadChildren: () =>
          import('./features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'admins',
        canActivate: [AuthV5Guard], // Nivel 3: Contexto de escuela (admin es nivel escuela)
        loadChildren: () =>
          import('./features/admins/admins.module').then(m => m.AdminsModule)
      },
      {
        path: 'settings',
        canActivate: [AuthV5Guard], // Nivel 3: Contexto de escuela
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
