import { Component, Input } from "@angular/core";
import { MOCK_POSIBLE_EXTRAS } from "../../mocks/course";
import moment from "moment";

@Component({
  selector: "booking-form-details-colective-flex",
  templateUrl: "./form-details-colective-flex.component.html",
  styleUrls: ["./form-details-colective-flex.component.scss"],
})
export class FormDetailsColectiveFlexComponent {
  @Input() course: any;
  @Input() utilizer: any;
  posibleExtras;
  extraPrice = "90 CHF";
  constructor() {
    //esto deberia venir en course.course_extras
    this.posibleExtras = MOCK_POSIBLE_EXTRAS;
  }

  formatDate(date: Date) {
    return moment(date).format("DD.MM.YYYY");
  }
}
