import { Component, Input } from "@angular/core";
import { LangService } from "src/service/langService";
import { UtilsService } from "src/service/utils.service";

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
  @Input() date: any;
  @Input() monitor: any;
  @Input() total: any;

  constructor(
    protected langService: LangService,
    protected utilsService: UtilsService
  ) {}
}
