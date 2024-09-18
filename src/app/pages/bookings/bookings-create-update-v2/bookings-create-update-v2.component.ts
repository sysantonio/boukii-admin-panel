import { Component, ChangeDetectorRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BookingDialogComponent } from "./components/booking-dialog/booking-dialog.component";
import { MOCK_MONITORS } from "./mocks/monitor";
import { MOCK_USER1, MOCK_USER2 } from "./mocks/user";
import { MOCK_POSIBLE_EXTRAS } from "./mocks/course";
import { BookingDescriptionCardDate } from "./components/booking-description-card/booking-description-card.component";
import { changeMonitorOptions } from "src/app/static-data/changeMonitorOptions";

@Component({
  selector: "bookings-create-update-v2",
  templateUrl: "./bookings-create-update-v2.component.html",
  styleUrls: ["./bookings-create-update-v2.component.scss"],
})
export class BookingsCreateUpdateV2Component {
  currentStep = 0;
  currentBookingData = {};
  client: any;
  mainClient: any;
  utilizers: any;
  sport: any;
  sportLevel: any;
  forceStep;
  dates: any;
  normalizedDates: BookingDescriptionCardDate[];
  course;
  monitors;
  clientObs;
  schoolObs;
  total;
  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    // TODO: El componente BookingDescriptionCard trabaja con una interfaz asi, si los datos desde el formulario no llegan asi habra que normalizarlos
    this.normalizedDates = [
      {
        date: "2024-09-16T00:00:00.000000Z",
        startHour: "09:00",
        endHour: "11:00",
        price: "90.00",
        currency: "CHF",
        //estos datos son opcionales, si se envian se mostrara los detalles dentro dentro de cada fecha
        monitor: MOCK_MONITORS[0],
        utilizer: [MOCK_USER1],
        extras: [MOCK_POSIBLE_EXTRAS[0]],
        changeMonitorOption: changeMonitorOptions[0],
      },
      {
        date: "2024-09-17T00:00:00.000000Z",
        startHour: "09:00",
        endHour: "11:00",
        price: "90.00",
        currency: "CHF",
        //estos datos son opcionales, si se envian se mostrara los detalles dentro dentro de cada fecha
        monitor: MOCK_MONITORS[1],
        utilizer: [MOCK_USER2],
        extras: [MOCK_POSIBLE_EXTRAS[1]],
        changeMonitorOption: changeMonitorOptions[1],
      },
      {
        date: "2024-09-18T00:00:00.000000Z",
        startHour: "09:00",
        endHour: "11:00",
        price: "90.00",
        currency: "CHF",
      },
      {
        date: "2024-09-19T00:00:00.000000Z",
        startHour: "09:00",
        endHour: "11:00",
        price: "90.00",
        currency: "CHF",
        //estos datos son opcionales, si se envian se mostrara los detalles dentro dentro de cada fecha
        monitor: MOCK_MONITORS[1],
        utilizer: [MOCK_USER2],
        extras: [MOCK_POSIBLE_EXTRAS[1], MOCK_POSIBLE_EXTRAS[2]],
        changeMonitorOption: changeMonitorOptions[2],
      },
    ];
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

    this.client = client;
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
    //this.normalizedDates= this.normalizeDates()
  }

  calculateTotal() {
    let total = 0;

    // Verifica si el curso es del tipo 1
    if (this.course.course_type === 1) {
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
