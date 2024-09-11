import { Component, Input } from "@angular/core";
import { MOCK_POSIBLE_EXTRAS } from "../../mocks/course";
@Component({
  selector: "booking-form-details-colective-fix",
  templateUrl: "./form-details-colective-fix.component.html",
  styleUrls: ["./form-details-colective-fix.component.scss"],
})
export class FormDetailsColectiveFixComponent {
  @Input() course: any;
  @Input() utilizer: any;
  posibleExtras;
  extraPrice = "90 CHF";
  constructor() {
    //esto deberia venir en course.course_extras
    this.posibleExtras = MOCK_POSIBLE_EXTRAS;
  }
}
