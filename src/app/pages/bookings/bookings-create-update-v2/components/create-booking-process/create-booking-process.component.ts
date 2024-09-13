import { Component, ChangeDetectorRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BookingDialogComponent } from "../booking-dialog/booking-dialog.component";
import { MOCK_MONITORS } from "../../mocks/monitor";
import { MOCK_USER1, MOCK_USER2 } from "../../mocks/user";
import { MOCK_POSIBLE_EXTRAS } from "../../mocks/course";
import { BookingDescriptionCardDate } from "../booking-description-card/booking-description-card.component";
import { changeMonitorOptions } from "src/app/static-data/changeMonitorOptions";

@Component({
  selector: "create-booking-process",
  templateUrl: "./create-booking-process.component.html",
  styleUrls: ["./create-booking-process.component.scss"],
})

export class CreateBookingProcessComponent {
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
      step5: { dates },
      step6: { clientObs, schoolObs },
    } = formData.value;

    this.client = client;
    this.mainClient = mainClient;
    this.utilizers = utilizers;
    this.sport = sport;
    this.sportLevel = sportLevel;
    this.course = course;
    this.dates = dates;
    // TODO: habra que recogerlo de las dates configuradas en el step5
    this.monitors = MOCK_MONITORS;
    /*     this.clientObs = clientObs;
    this.schoolObs = schoolObs; */

    this.clientObs = "observacion text";

    this.schoolObs = "observacion text 2";
    // TODO: habra que cambiar esto por el dato real calculado
    this.total = "500,00 CHF";
    // TODO: crear funcion normalizadora
    //this.normalizedDates= this.normalizeDates()
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
        dates: this.normalizedDates,
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
