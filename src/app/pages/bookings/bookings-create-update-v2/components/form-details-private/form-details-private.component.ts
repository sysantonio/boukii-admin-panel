import { Component, Input } from "@angular/core";
import {
  MOCK_POSIBLE_HOURS,
  MOCK_POSIBLE_DURATION,
  MOCK_POSIBLE_EXTRAS,
} from "../../mocks/course";
import { MOCK_MONITORS } from "../../mocks/monitor";
import { changeMonitorOptions } from "src/app/static-data/changeMonitorOptions";

@Component({
  selector: "booking-form-details-private",
  templateUrl: "./form-details-private.component.html",
  styleUrls: ["./form-details-private.component.scss"],
})
export class FormDetailsPrivateComponent {
  @Input() course: any;
  @Input() utilizers: any;
  @Input() monitors: any;
  selectedMonitor;
  selectedChangeMonitor;

  posibleHours;
  posibleDurations;
  posibleMonitors;
  posibleChangeMonitorSelection = changeMonitorOptions;
  posibleExtras;
  extraPrice = ["90 CHF", "120 CHF"];

  constructor() {
    // esto debe mapearse de alguna forma desde el course
    this.posibleHours = MOCK_POSIBLE_HOURS;
    this.posibleDurations = MOCK_POSIBLE_DURATION;
    // esto debe cogerse desde los monitors
    this.posibleMonitors = MOCK_MONITORS;
    //esto deberia venir en course.course_extras
    this.posibleExtras = MOCK_POSIBLE_EXTRAS;
  }
}
