import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import { VexRoutes } from 'src/@vex/interfaces/vex-route.interface';
import { BookingsComponent } from './bookings.component';


const routes: VexRoutes = [
  {
    path: '',
    component: BookingsComponent,
    data: {
      toolbarShadowEnabled: true
    }
  },/*
  {
    path: 'create',
    component: UserCreateUpdateComponent,
    data: {
      toolbarShadowEnabled: true
    }
  },
  {
    path: 'update/:id',
    component: UserCreateUpdateComponent,
    data: {
      toolbarShadowEnabled: true
    }
  }*/
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsRoutingModule {
}
