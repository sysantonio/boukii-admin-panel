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

  calculateDiscountedPrice(date: any, index: number): number {
    let price = parseFloat(date.price); // Asegúrate de convertir el precio a número

    if (this.course && this.course.discounts) {
      const discounts = JSON.parse(this.course.discounts);

      discounts.forEach(discount => {
        if (discount.date === index + 1) { // Index + 1 porque los índices en arrays comienzan en 0
          price -= (price * (discount.percentage / 100));
        }
      });
    }

    return price;
  }

  isDiscounted(date: any, index: number): boolean {
    const price = parseFloat(date.price);
    if (this.course && this.course.discounts) {
      const discounts = JSON.parse(this.course.discounts);
      return discounts.some(discount => discount.date === index + 1); // Index + 1 porque los índices en arrays comienzan en 0
    }
    return false;
  }

  getExtraDescription(dateExtra) {
    return dateExtra.map((extra) => extra.description).join(", ");
  }

  getExtraName(dateExtra) {
    return dateExtra.map((extra) => extra.name).join(", ");
  }

  getExtraPrice(dateExtra) {
    return dateExtra.map((extra) => extra.price).join(", ");
  }

  protected readonly parseFloat = parseFloat;
}
