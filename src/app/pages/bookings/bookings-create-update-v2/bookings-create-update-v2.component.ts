import { Component, ChangeDetectorRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BookingDialogComponent } from "./components/booking-dialog/booking-dialog.component";
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
  date;
  course;
  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  handleFormChange(formData) {
    const {
      step1: { client, mainClient },
      step2: { utilizers },
      step3: { sport, sportLevel },
      step4: { date, course },
    } = formData.value;

    this.client = client;
    this.mainClient = mainClient;
    this.utilizers = utilizers;
    this.sport = sport;
    this.sportLevel = sportLevel;
    this.course = course;
    this.date = date;
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
        date: this.date,
      },
    });
  }

  forceChange(newStep) {
    if (newStep < this.currentStep) {
      this.forceStep = newStep;
      this.cdr.detectChanges();
    }
  }
}
