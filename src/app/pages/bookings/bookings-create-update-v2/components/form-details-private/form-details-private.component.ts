import { Component, Input } from "@angular/core";
import {
  MOCK_POSIBLE_HOURS,
  MOCK_POSIBLE_DURATION,
  MOCK_POSIBLE_EXTRAS,
} from "../../mocks/course";
import { MOCK_MONITORS } from "../../mocks/monitor";

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
  selectedPosibleMonitor;

  posibleHours;
  posibleDurations;
  posibleMonitors;
  posibleMonitorSelection = [
    {
      description: "select_monitor_free",
      value: "free",
      icon: "done",
      class: "text-green",
    },
    {
      description: "select_monitor_posible",
      value: "posible",
      icon: "warning_amber",
      class: "text-yellow",
    },
    {
      description: "select_monitor_forbidden",
      value: "forbidden",
      icon: "error_outline",
      class: "text-red",
    },
  ];
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
