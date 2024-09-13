import { Component } from "@angular/core";

@Component({
  selector: "bookings-create-update-v2",
  templateUrl: "./bookings-create-update-v2.component.html",
  styleUrls: ["./bookings-create-update-v2.component.scss"],
})
export class BookingsCreateUpdateV2Component {
  isCreationProcess = false;
  isEndBooking = true;

  constructor() {}
}
