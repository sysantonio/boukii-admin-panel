import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BookingsCreateUpdateV2Component } from "./bookings-create-update-v2.component";
import { MatCardModule } from "@angular/material/card";

import { TranslateModule } from "@ngx-translate/core";
import { BookingComponentsModule } from "./components/components.module";

@NgModule({
  declarations: [BookingsCreateUpdateV2Component],
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    BookingComponentsModule,
  ],
  exports: [BookingsCreateUpdateV2Component],
})
export class BookingsCreateUpdateV2Module {}
