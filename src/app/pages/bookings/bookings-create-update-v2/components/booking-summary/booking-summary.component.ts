import { Component, Input } from "@angular/core";

export interface Activity {}

@Component({
  selector: "booking-summary",
  templateUrl: "./booking-summary.component.html",
  styleUrls: ["./booking-summary.component.scss"],
})
export class BookingSummaryComponent {
  @Input() activities: any;
}
