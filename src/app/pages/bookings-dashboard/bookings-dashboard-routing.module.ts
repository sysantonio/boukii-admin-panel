import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VexRoutes } from 'src/@vex/interfaces/vex-route.interface';
import { BookingsDashboardComponent } from './bookings-dashboard.component';

const routes: VexRoutes = [
  {
    path: '',
    component: BookingsDashboardComponent,
    data: { toolbarShadowEnabled: true }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsDashboardRoutingModule {}
