import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CustomLayoutComponent } from './custom-layout/custom-layout.component';
import { VexRoutes } from '../@vex/interfaces/vex-route.interface';
import { AuthGuard } from './auth.guard';

const childrenRoutes: VexRoutes = [
  {
    path: 'home',
    redirectTo: '/home'
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home'
  },
  {
    path: '',
    children: [
      {
        path: 'home',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'timeline',
        loadChildren: () => import('./pages/timeline/timeline.module').then(m => m.TimelineModule),
        canActivate: [AuthGuard],
      },
/*      {
        path: 'calendar',
        loadChildren: () => import('./pages/calendar/calendar.module').then(m => m.CalendarMonitorModule),
        canActivate: [AuthGuard],
      },*/
      {
        path: 'bookings',
        loadChildren: () => import('./pages/bookings/bookings.module').then(m => m.BookingsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'bookings/create',
        loadChildren: () => import('./pages/bookings/bookings-create-update/bookings-create-update.module').then(m => m.BookingsCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'bookings/update/:id',
        loadChildren: () => import('./pages/bookings/booking-detail/booking-detail.module').then(m => m.BookingDetailModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'bookings/edit/:id',
        loadChildren: () => import('./pages/bookings/bookings-create-update-edit/bookings-create-update-edit.module').then(m => m.BookingsCreateUpdateEditModule),
        canActivate: [AuthGuard],
      },
      /** PARTE PARA MAQUETAR **/
      {
        path: 'bookings2',
        loadChildren: () => import('./pages/bookings2/bookings.module').then(m => m.BookingsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'bookings2/create',
        loadChildren: () => import('./pages/bookings2/bookings-create-update/bookings-create-update.module').then(m => m.BookingsCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'bookings2/update/:id',
        loadChildren: () => import('./pages/bookings2/booking-detail/booking-detail.module').then(m => m.BookingDetailModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'bookings2/edit/:id',
        loadChildren: () => import('./pages/bookings2/bookings-create-update-edit/bookings-create-update-edit.module').then(m => m.BookingsCreateUpdateEditModule),
        canActivate: [AuthGuard],
      },
      /** **/
      {
        path: 'courses',
        loadChildren: () => import('./pages/courses/courses.module').then(m => m.CoursesModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'courses/create',
        loadChildren: () => import('./pages/courses/courses-create-update/courses-create-update.module').then(m => m.CoursesCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'courses/update/:id',
        loadChildren: () => import('./pages/courses/courses-create-update/courses-create-update.module').then(m => m.CoursesCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'courses/detail/:id',
        loadChildren: () => import('./pages/courses/courses-create-update/courses-create-update.module').then(m => m.CoursesCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'bonuses',
        loadChildren: () => import('./pages/bonuses/bonuses.module').then(m => m.BonusesModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'bonuses/create',
        loadChildren: () => import('./pages/bonuses/bonuses-create-update/bonuses-create-update.module').then(m => m.BonusesCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'bonuses/update/:id',
        loadChildren: () => import('./pages/bonuses/bonuses-create-update/bonuses-create-update.module').then(m => m.BonusesCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'messages',
        loadChildren: () => import('./pages/communications/communications.module').then(m => m.CommunicationsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'stats',
        loadChildren: () => import('./pages/analytics/analytics.module').then(m => m.AnalyticsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'monitors',
        loadChildren: () => import('./pages/monitors/monitors.module').then(m => m.MonitorsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'monitors/create',
        loadChildren: () => import('./pages/monitors/monitors-create-update/monitors-create-update.module').then(m => m.MonitorsCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'monitors/update/:id',
        loadChildren: () => import('./pages/monitors/monitors-create-update/monitors-create-update.module').then(m => m.MonitorsCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'clients',
        loadChildren: () => import('./pages/clients/clients.module').then(m => m.ClientsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'clients/create',
        loadChildren: () => import('./pages/clients/client-create-update/client-create-update.module').then(m => m.ClientsCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'clients/update/:id',
        loadChildren: () => import('./pages/clients/client-create-update/client-create-update.module').then(m => m.ClientsCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'admins',
        loadChildren: () => import('./pages/admins/admins.module').then(m => m.AdminsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'admins/create',
        loadChildren: () => import('./pages/admins/admin-create-update/admin-create-update.module').then(m => m.AdminCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'admins/update/:id',
        loadChildren: () => import('./pages/admins/admin-create-update/admin-create-update.module').then(m => m.AdminCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'settings',
        loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'mail',
        loadChildren: () => import('./pages/mail/mail.module').then(m => m.MailModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'communications',
        loadChildren: () => import('./pages/communications/communications.module').then(m => m.CommunicationsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'discount-codes',
        loadChildren: () => import('./pages/discounts/discounts.module').then(m => m.DiscountsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'discount-codes/create',
        loadChildren: () => import('./pages/discounts/discounts-create-update/discounts-create-update.module').then(m => m.DiscountsCreateUpdateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'discount-codes/update/:id',
        loadChildren: () => import('./pages/discounts/discounts-create-update/discounts-create-update.module').then(m => m.DiscountsCreateUpdateModule),
        canActivate: [AuthGuard],
      },
    ]
  }
];


const routes: Routes = [
  {
    path: '',
    component: CustomLayoutComponent,
    children: childrenRoutes
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule),
  },
  {
    path: 'recover-password/:token',
    loadChildren: () => import('./pages/recover-password/recover-password.module').then(m => m.RecoverPasswordModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
