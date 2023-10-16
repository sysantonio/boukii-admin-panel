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
        path: 'user',
        loadChildren: () => import('./pages/user/user.module').then(m => m.UserModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'user/create',
        loadChildren: () => import('./pages/user/user-create-update/user-create-update.module').then(m => m.UserCreateUpdateModule),
        canActivate: [AuthGuard],
      }
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
