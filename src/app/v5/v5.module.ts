import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { V5RoutingModule } from './v5-routing.module';
import { V5LayoutComponent } from './layout/v5-layout.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthV5Interceptor } from './core/interceptors/auth-v5.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { ApiV5Service } from './core/services/api-v5.service';
import { SeasonContextService } from './core/services/season-context.service';
import { AuthV5Service } from './core/services/auth-v5.service';
import { NotificationService } from './core/services/notification.service';
import { LoadingService } from './core/services/loading.service';
import { SeasonsModule } from './features/seasons/seasons.module';

@NgModule({
  declarations: [
    V5LayoutComponent,
    WelcomeComponent,
    NavbarComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    V5RoutingModule,
    SeasonsModule
  ],
  providers: [
    ApiV5Service,
    SeasonContextService,
    AuthV5Service,
    NotificationService,
    LoadingService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthV5Interceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }
  ]
})
export class V5Module {}
