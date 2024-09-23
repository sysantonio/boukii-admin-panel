import { Component, ChangeDetectorRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BookingDialogComponent } from "./components/booking-dialog/booking-dialog.component";
import { MOCK_MONITORS } from "./mocks/monitor";
import { MOCK_USER1, MOCK_USER2 } from "./mocks/user";
import { MOCK_POSIBLE_EXTRAS } from "./mocks/course";
import { BookingDescriptionCardDate } from "./components/booking-description-card/booking-description-card.component";
import { changeMonitorOptions } from "src/app/static-data/changeMonitorOptions";
import moment from 'moment';

@Component({
  selector: "bookings-create-update-v2",
  templateUrl: "./bookings-create-update-v2.component.html",
  styleUrls: ["./bookings-create-update-v2.component.scss"],
})
export class BookingsCreateUpdateV2Component {
  currentStep = 0;
  currentBookingData = {};
  mainClient: any;
  utilizers: any;
  sport: any;
  sportLevel: any;
  forceStep;
  dates: any;
  normalizedDates: any[];
  course;
  monitors;
  clientObs;
  schoolObs;
  total;
  isDetail = false;
  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    // TODO: El componente BookingDescriptionCard trabaja con una interfaz asi, si los datos desde el formulario no llegan asi habra que normalizarlos
    this.normalizedDates =[]
  }

  handleFormChange(formData) {
    const {
      step1: { client, mainClient },
      step2: { utilizers },
      step3: { sport, sportLevel },
      step4: { course },
      step5: { course_dates },
      step6: { clientObs, schoolObs },
    } = formData.value;

    this.mainClient = mainClient;
    this.utilizers = utilizers;
    this.sport = sport;
    this.sportLevel = sportLevel;
    this.course = course;
    this.dates = course_dates ? this.getSelectedDates(course_dates) : [];
    //this.monitors = MOCK_MONITORS;
    this.clientObs = clientObs;
    this.schoolObs = schoolObs;
    // TODO: habra que cambiar esto por el dato real calculado
    // Calcula el total de la reserva
    if(this.course && this.dates) {
      this.calculateTotal();
    }
    // TODO: crear funcion normalizadora
    if(this.course && this.dates && this.clientObs && this.schoolObs ) {
      this.normalizeDates()
    }
  }

  calculateTotal() {
    let total = 0;

    // Verifica si el curso es del tipo 1
    if (this.course.course_type === 1) {
      total = this.calculateColectivePrice();
    } else if(this.course.course_type === 2) {
      total = this.calculatePrivatePrice();
    }

    // Suma el precio total de los extras elegidos
    const extrasTotal = this.dates.reduce((acc, date) => {
      if (date.extras && date.extras.length) {
        const extrasPrice = date.extras.reduce((extraAcc, extra) => {
          const price = parseFloat(extra.price) || 0; // Convierte el precio del extra a un número
          return extraAcc + price;
        }, 0);
        return acc + extrasPrice;
      }
      return acc;
    }, 0);

    total += extrasTotal;

    // Actualiza el total
    this.total = `${total.toFixed(2)} ${this.course.currency}`;
  }

  private calculatePrivatePrice() {
    let total = 0;

    if (this.course.is_flexible) {
      // Calcula el precio basado en el intervalo y el número de utilizadores para cada fecha
      this.dates.forEach(date => {
        const duration = date.duration; // Duración de cada fecha
        const selectedUtilizers = this.utilizers.length; // Número de utilizadores

        // Encuentra el intervalo de duración que se aplica
        const interval = this.course.price_range.find(range => {
          return range.intervalo === duration; // Comparar con la duración de la fecha
        });

        if (interval) {
          total += parseFloat(interval[selectedUtilizers]); // Precio por utilizador para cada fecha
        }

        // Suma el precio total de los extras para cada utilizador en esta fecha
        date.utilizers.forEach(utilizer => {
          if (utilizer.extras && utilizer.extras.length) {
            const extrasTotal = utilizer.extras.reduce((acc, extra) => {
              const price = parseFloat(extra.price) || 0; // Convierte el precio del extra a un número
              return acc + price;
            }, 0);
            total += extrasTotal; // Suma el total de extras por cada utilizador
          }
        });

      });
    } else {
      // Si el curso no es flexible
      this.dates.forEach(date => {
        const dateTotal = parseFloat(this.course.price) * this.utilizers.length; // Precio por número de utilizadores
        total += dateTotal;
        date.utilizers.forEach(utilizer => {
          if (utilizer.extras && utilizer.extras.length) {
            const extrasTotal = utilizer.extras.reduce((acc, extra) => {
              const price = parseFloat(extra.price) || 0; // Convierte el precio del extra a un número
              return acc + price;
            }, 0);
            total += extrasTotal; // Suma el total de extras por cada utilizador
          }
        });
      });
    }

    return total;
  }

  private normalizeDates() {
    this.normalizedDates.push(
      {
        utilizers: this.utilizers,
        sport: this.sport,
        sportLevel: this.sportLevel,
        course: this.course,
        dates: this.dates,
        clientObs: this.clientObs,
        schoolObs: this.dates,
        total: this.total

      }
    )
    this.isDetail = true;
  }

// Método para obtener el intervalo de precios basado en la duración
  private getPriceInterval(duration: number) {
    const priceRanges = this.course.price_range;
    return priceRanges.find(interval => {
      const intervalDuration = this.parseDuration(interval.intervalo);
      return duration <= intervalDuration;
    });
  }

// Método para parsear la duración en formato de texto a minutos
  private parseDuration(durationStr: string): number {
    const parts = durationStr.split(' ');
    let totalMinutes = 0;

    parts.forEach(part => {
      if (part.includes('h')) {
        totalMinutes += parseInt(part, 10) * 60;
      } else if (part.includes('m')) {
        totalMinutes += parseInt(part, 10);
      }
    });

    return totalMinutes;
  }

  private calculateColectivePrice() {
    let total = 0;
    if (this.course.is_flexible) {
      // Si el curso es flexible
      const selectedDatesCount = this.dates.length; // Número de fechas seleccionadas
      total = this.course.price * selectedDatesCount;

      // Aplica los descuentos
      const discounts = this.course.discounts ? JSON.parse(this.course.discounts) : [];
      discounts.forEach((discount: { date: number; percentage: number }) => {
        if (discount.date <= selectedDatesCount) {
          const discountAmount = (this.course.price * discount.percentage) / 100;
          total -= discountAmount;
        }
      });
    } else {
      // Si el curso no es flexible
      total = parseFloat(this.course.price);
    }
    return total;
  }

  // Filtra las fechas seleccionadas
  getSelectedDates(dates) {
    return dates.filter((date: any) => date.selected);
  }

  openBookingDialog() {
    this.dialog.open(BookingDialogComponent, {
      width: "400px",
      panelClass: "customBookingDialog",
      position: {
        bottom: "24px",
        right: "24px",
      },
      data: {
        utilizers: this.utilizers,
        sport: this.sport,
        sportLevel: this.sportLevel,
        course: this.course,
        dates: this.dates,
        monitors: this.monitors,
        clientObs: this.clientObs,
        schoolObs: this.schoolObs,
        total: this.total,
      },
    });
  }

  forceChange(newStep) {
    //if (newStep < this.currentStep) {
    this.forceStep = newStep;
    this.cdr.detectChanges();
    //}
  }
}
