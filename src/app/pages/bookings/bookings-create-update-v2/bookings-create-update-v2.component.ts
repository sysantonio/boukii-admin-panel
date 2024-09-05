import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "bookings-create-update-v2",
  templateUrl: "./bookings-create-update-v2.component.html",
  styleUrls: ["./bookings-create-update-v2.component.scss"],
})
export class BookingsCreateUpdateV2Component {
  clientsForm = new FormControl();
  initialState = {
    client_main_id: null,
  };

  constructor(public translateService: TranslateService) {}
}
