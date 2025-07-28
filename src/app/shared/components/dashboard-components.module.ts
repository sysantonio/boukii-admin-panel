import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';

// Componentes del dashboard
import { MetricCardComponent } from './metric-card/metric-card.component';
import { WelcomeBannerComponent } from './welcome-banner/welcome-banner.component';
import { WeatherWidgetComponent } from './weather-widget/weather-widget.component';
import { TodayBookingsTableComponent } from './today-bookings-table/today-bookings-table.component';

@NgModule({
  declarations: [
    MetricCardComponent,
    WelcomeBannerComponent,
    WeatherWidgetComponent,
    TodayBookingsTableComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatCardModule,
    MatBadgeModule,
    MatChipsModule
  ],
  exports: [
    MetricCardComponent,
    WelcomeBannerComponent,
    WeatherWidgetComponent,
    TodayBookingsTableComponent
  ]
})
export class DashboardComponentsModule { }