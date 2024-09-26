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
import { FormBuilder, FormGroup } from '@angular/forms';
import {BookingService} from '../../../../service/bookings.service';

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
  forms: FormGroup[];
  dates: any;
  normalizedDates: any[];
  course;
  monitors;
  clientObs;
  schoolObs;
  total;
  deleteModal: boolean = false
  deleteIndex: number = 1
  endModal: boolean = false
  isDetail = false;
  selectedIndexForm = null;
  selectedForm: FormGroup;
  payModal: boolean = false;
  paymentMethod: number = 1; // Valor por defecto
  selectedPaymentOption: string = '';
  paymentOptions: any[] = [{type: 'Tarjeta', value: 4}, {type: 'Efectivo', value: 1}]; // Opciones de pago para "Pago directo"

  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    public bookingService: BookingService
  ) {
    // TODO: El componente BookingDescriptionCard trabaja con una interfaz asi, si los datos desde el formulario no llegan asi habra que normalizarlos
    this.normalizedDates = []
    this.forms = []
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
    // Calcula el total de la reserva
    if (this.course && this.dates) {
      this.calculateTotal();
    }

    if (this.course && this.dates && this.clientObs && this.schoolObs) {
      if (this.selectedIndexForm === null) {
        this.forms.push(formData);
      } else {
        this.forms[this.selectedIndexForm] = formData;
      }
      this.normalizeDates()
    }
  }

  editActivity(data: any, index: number) {
    this.isDetail = false;
    this.currentStep = data.step;
    this.selectedIndexForm = index;
    this.selectedForm = this.forms[index];
    this.forceStep = data.step;

    // Forzar la detección de cambios
    this.cdr.detectChanges();
  }

  addNewActivity() {
    this.isDetail = false;
    this.currentStep = 1;

    // Copiar solo el contenido de step1 de this.forms[0]
    const step1Controls = this.forms[0].get('step1').value;

    // Crear un nuevo formGroup solo con los controles de step1 y vaciar el resto
    this.selectedForm = this.fb.group({
      step1: this.fb.group(step1Controls),        // Copia step1
      step2: this.fb.group({}),            // Vacío
      step3: this.fb.group({}),            // Vacío
      step4: this.fb.group({}),            // Vacío
      step5: this.fb.group({}),            // Vacío
      step6: this.fb.group({})             // Vacío
    });

    this.utilizers = [];
    this.sport = null;
    this.sportLevel = null;
    this.course = null;
    this.dates = [];
    this.clientObs = null;
    this.schoolObs = null;


    this.forceStep = 1;

    // Forzar la detección de cambios
    this.cdr.detectChanges();
  }


  calculateTotal() {
    let total = 0;

    // Verifica si el curso es del tipo 1
    if (this.course.course_type === 1) {
      total = this.calculateColectivePrice();
    } else if (this.course.course_type === 2) {
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
    // Limpia el array normalizedDates antes de llenarlo
    this.normalizedDates = this.forms.map(form => {
      const {
        step1: { client, mainClient },
        step2: { utilizers },
        step3: { sport, sportLevel },
        step4: { course },
        step5: { course_dates },
        step6: { clientObs, schoolObs },
      } = form.value;

      const dates = course_dates ? this.getSelectedDates(course_dates) : [];

      // Calcular el total para cada actividad
      const total = this.calculateIndividualTotal(course, dates, utilizers);

      return {
        utilizers,
        sport,
        sportLevel,
        course,
        dates,
        clientObs,
        schoolObs,
        total: `${total.toFixed(2)} ${course.currency}` // Guardar el total calculado para esta actividad
      };
    });

    this.isDetail = true;
  }

  private calculateIndividualTotal(course, dates, utilizers) {
    let total = 0;

    if (course.course_type === 1) {
      total = this.calculateColectivePriceForDates(course, dates);
    } else if (course.course_type === 2) {
      total = this.calculatePrivatePriceForDates(course, dates, utilizers);
    }

    // Sumar el total de los extras seleccionados para las fechas
    const extrasTotal = dates.reduce((acc, date) => {
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

    return total;
  }

  private calculateColectivePriceForDates(course, dates) {
    let total = 0;
    if (course.is_flexible) {
      const selectedDatesCount = dates.length; // Número de fechas seleccionadas
      total = course.price * selectedDatesCount;

      const discounts = course.discounts ? JSON.parse(course.discounts) : [];
      discounts.forEach((discount: { date: number; percentage: number }) => {
        if (discount.date <= selectedDatesCount) {
          const discountAmount = (course.price * discount.percentage) / 100;
          total -= discountAmount;
        }
      });
    } else {
      total = parseFloat(course.price);
    }
    return total;
  }

  private calculatePrivatePriceForDates(course, dates, utilizers) {
    let total = 0;

    if (course.is_flexible) {
      dates.forEach(date => {
        const duration = date.duration;
        const selectedUtilizers = utilizers.length;

        const interval = course.price_range.find(range => {
          return range.intervalo === duration;
        });

        if (interval) {
          total += parseFloat(interval[selectedUtilizers]);
        }

        date.utilizers.forEach(utilizer => {
          if (utilizer.extras && utilizer.extras.length) {
            const extrasTotal = utilizer.extras.reduce((acc, extra) => {
              const price = parseFloat(extra.price) || 0;
              return acc + price;
            }, 0);
            total += extrasTotal;
          }
        });
      });
    } else {
      dates.forEach(date => {
        const dateTotal = parseFloat(course.price) * utilizers.length;
        total += dateTotal;
        date.utilizers.forEach(utilizer => {
          if (utilizer.extras && utilizer.extras.length) {
            const extrasTotal = utilizer.extras.reduce((acc, extra) => {
              const price = parseFloat(extra.price) || 0;
              return acc + price;
            }, 0);
            total += extrasTotal;
          }
        });
      });
    }

    return total;
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
        isDetail: this.isDetail,
        mainClient: this.mainClient,
        normalizedDates: this.normalizedDates
      },
    });
  }

  sumActivityTotal(): number {
    return this.normalizedDates.reduce((acc, item) => {
      const numericValue = parseFloat(item.total.replace(/[^\d.-]/g, '')); // Eliminar cualquier cosa que no sea un número o signo
      return acc + numericValue;
    }, 0);
  }

  forceChange(newStep) {
    this.forceStep = newStep;
    this.cdr.detectChanges();
    
  }


  onPaymentMethodChange(event: any): void {

  }

  // Método para finalizar la reserva
  finalizeBooking(): void {
    debugger;
    console.log('Finalizar con confirmación sin pago');
    /*let bookingData = this.bookingService.*/
  }
}
