import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { V5RoutingModule } from './v5-routing.module';
import { V5LayoutComponent } from './layout/v5-layout.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

@NgModule({
  declarations: [V5LayoutComponent, WelcomeComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    V5RoutingModule
  ]
})
export class V5Module {}
