import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BookingsCreateUpdateV2Component } from "./bookings-create-update-v2.component";
import { MatCardModule } from "@angular/material/card";
import { SecondaryToolbarModule } from "src/@vex/components/secondary-toolbar/secondary-toolbar.module";
import { BreadcrumbsModule } from "src/@vex/components/breadcrumbs/breadcrumbs.module";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

import { TranslateModule } from "@ngx-translate/core";
import { BookingComponentsModule } from "./components/components.module";
import { FluxModalModule } from "src/@vex/components/flux-component/flux-modal/app.module";

@NgModule({
  declarations: [BookingsCreateUpdateV2Component],
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    BookingComponentsModule,
    SecondaryToolbarModule,
    BreadcrumbsModule,
    MatIconModule,
    MatButtonModule,
    FluxModalModule
  ],
  exports: [BookingsCreateUpdateV2Component],
})
export class BookingsCreateUpdateV2Module { }
