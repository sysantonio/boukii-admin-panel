import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { VexRoutes } from "src/@vex/interfaces/vex-route.interface";
import { BookingsComponent } from "./bookings.component";
import { BookingsCreateUpdateComponent } from "./bookings-create-update/bookings-create-update.component";
import { BookingDetailComponent } from "./booking-detail/booking-detail.component";
import { BookingsCreateUpdateEditComponent } from "./bookings-create-update-edit/bookings-create-update-edit.component";
import { BookingsCreateUpdateV2Component } from "./bookings-create-update-v2/bookings-create-update-v2.component";
import { BookingDetailV2Component } from './booking-detail-v2/booking-detail-v2.component';

const routes: VexRoutes = [
  {
    path: "",
    component: BookingsComponent,
    data: {
      toolbarShadowEnabled: true,
    },
  },
  {
    path: "create",
    component: BookingsCreateUpdateComponent,
    data: {
      toolbarShadowEnabled: true,
    },
  },
  {
    path: "create-v2",
    component: BookingsCreateUpdateV2Component,
    data: {
      toolbarShadowEnabled: true,
    },
  },
  {
    path: "update/:id",
    component: BookingDetailComponent,
    data: {
      toolbarShadowEnabled: true,
    },
  },
  {
    path: "update-v2/:id",
    component: BookingDetailV2Component,
    data: {
      toolbarShadowEnabled: true,
    },
  },
  {
    path: "edit/:id",
    component: BookingsCreateUpdateEditComponent,
    data: {
      toolbarShadowEnabled: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingsRoutingModule { }
