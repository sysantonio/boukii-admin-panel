import { Component, Input } from "@angular/core";
import { ChangeMonitorOption } from "src/app/static-data/changeMonitorOptions";
import { LangService } from "src/service/langService";
import { UtilsService } from "src/service/utils.service";

export interface BookingDescriptionCardDate {
  date: string;
  startHour: string;
  endHour: string;
  price: string;
  currency: string;
  changeMonitorOption?: ChangeMonitorOption;
  monitor?: Record<string, any>;
  utilizer?: Record<string, any>[];
  extras?: Record<string, any>[];
}

@Component({
  selector: "booking-description-card",
  templateUrl: "./booking-description-card.component.html",
  styleUrls: ["./booking-description-card.component.scss"],
})
export class BookingDescriptionCard {
  @Input() utilizers: any;
  @Input() sport: any;
  @Input() sportLevel: any;
  @Input() course: any;
  @Input() dates: BookingDescriptionCardDate[];
  @Input() monitors: any;
  @Input() clientObs: any;
  @Input() schoolObs: any;
  @Input() total: any;

  constructor(
    protected langService: LangService,
    protected utilsService: UtilsService
  ) {}

  formatDate(date: string) {
    return this.utilsService.formatDate(date);
  }

  getExtraDescription(dateExtra) {
    return dateExtra.map((extra) => extra.description).join(", ");
  }
}
