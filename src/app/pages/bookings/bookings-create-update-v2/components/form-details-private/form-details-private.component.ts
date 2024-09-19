import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  MOCK_POSIBLE_HOURS,
  MOCK_POSIBLE_DURATION,
  MOCK_POSIBLE_EXTRAS,
} from "../../mocks/course";
import { MOCK_MONITORS } from "../../mocks/monitor";
import { changeMonitorOptions } from "src/app/static-data/changeMonitorOptions";
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment/moment';
import {UtilsService} from '../../../../../../service/utils.service';
import {ApiCrudService} from '../../../../../../service/crud.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: "booking-form-details-private",
  templateUrl: "./form-details-private.component.html",
  styleUrls: ["./form-details-private.component.scss"],
})
export class FormDetailsPrivateComponent implements OnInit {
  @Input() course: any;
  @Input() date: any;
  @Input() utilizers: any;
  @Input() sportLevel: any;
  @Input() initialData: any;
  @Output() stepCompleted = new EventEmitter<FormGroup>();
  @Output() prevStep = new EventEmitter();
  @Input() stepForm: FormGroup; // Recibe el formulario desde el padre
  @Input() addDateEvent!: boolean; // Recibe el evento como Input
  @Input() removeDateEvent!: boolean; // Recibe el evento como Input

  possibleHours;
  possibleDurations;
  possibleMonitors;
  possibleChangeMonitorSelection = changeMonitorOptions;
  possibleExtras;
  user;
  minDate: Date = new Date();
  season: any = [];
  holidays: any = [];
  myHolidayDates = [];

  constructor(private fb: FormBuilder,  private snackbar: MatSnackBar, public translateService: TranslateService,
              private crudService: ApiCrudService) {
    this.possibleMonitors = [];
  }

  ngOnChanges() {
    // Reacciona cuando el Input cambia
    if (this.addDateEvent) {
      this.addCourseDate(); // Llamamos a la función para añadir la fecha
    }
  }


  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("boukiiUser"));
    this.possibleExtras = this.course.course_extras;
    this.getSeason();
    this.initializeForm();
    this.setupExtrasValueChanges();
    this.possibleHours = this.generateCourseHours(this.course.hour_min, this.course.hour_max, this.course.minDuration, '5min');
    this.possibleDurations = this.generateCourseDurations(this.course.hour_min, this.course.hour_max);
  }

  getSeason() {
    this.crudService.list('/seasons', 1, 10000, 'asc', 'id',
      '&school_id='+this.user.schools[0].id+'&is_active=1')
      .subscribe((season) => {
        this.season = season.data[0];

        this.holidays = this.season.vacation_days !== null && this.season.vacation_days !== '' ? JSON.parse(this.season.vacation_days) : [];

        this.holidays.forEach(element => {
          this.myHolidayDates.push(moment(element).toDate());
        });
      })
  }

  initializeForm() {
    if (!this.stepForm.get('course_dates')) {
      this.stepForm.addControl('course_dates', this.fb.array([]));
    }
    if (this.initialData && this.initialData.length > 0) {
      // Si hay datos iniciales, usamos esos datos para restaurar los valores seleccionados
      this.initialData.forEach((data: any, index: number) => {
        this.addCourseDate(data);
      });
    } else {
      // Si no hay datos iniciales, añade una fecha por defecto
      this.addCourseDate();
    }
  }

  inUseDatesFilter = (d: Date): boolean => {
    if (!d) return false; // Si la fecha es nula o indefinida, no debería ser seleccionable.

    const formattedDate = moment(d).format('YYYY-MM-DD');
    const time = moment(d).startOf('day').valueOf(); // .getTime() es igual a .valueOf()
    const today = moment().startOf('day'); // Fecha actual (sin hora, solo día)

    // Verifica si la fecha es anterior a hoy.
    const isPastDate = moment(d).isBefore(today);

    // Encuentra si la fecha actual está en myHolidayDates.
    const isHoliday = this.myHolidayDates.some(x => x.getTime() === time);

    // Encuentra si la fecha actual está en selectedItem.course_dates y si es activa.
    const courseDate = this.course.course_dates.find(s => moment(s.date).format('YYYY-MM-DD') === formattedDate);
    const isActive = courseDate ? (courseDate.active || courseDate.active === 1) : false;

    // La fecha debería ser seleccionable si no es un día festivo y está activa (o sea, active no es falso ni 0).
    return !isHoliday && isActive && !isPastDate;
  }

  addCourseDate(initialData: any = null) {
    const utilizerArray = this.fb.array(this.utilizers.map(utilizer =>
      this.createUtilizer(utilizer, initialData?.utilizers?.find(u => u.first_name === utilizer.first_name && u.last_name === utilizer.last_name)?.extras || [])
    ));

    let formattedDate = this.date ? this.date.format('YYYY-MM-DD') : null;

    if (this.courseDates.length > 0) {
      const lastDateGroup = this.courseDates.at(this.courseDates.length - 1);
      const lastDate = lastDateGroup.get('date').value;

      // Si quieres ajustar la nueva fecha para que sea al día siguiente
      formattedDate = moment(lastDate).add(1, 'day').format('YYYY-MM-DD');
    }

    const courseDateGroup = this.fb.group({
      selected: [initialData ? initialData.selected : true],
      date: [initialData ? initialData.date : formattedDate, Validators.required],
      startHour: [initialData ? initialData.startHour : null, Validators.required],
      endHour: [initialData ? initialData.endHour : null, Validators.required],
      duration: [initialData ? initialData.duration : (!this.course.is_flexible ? this.course.duration : null), Validators.required],
      price: [initialData ? initialData.price : null],
      currency: this.course.currency,
      monitor: [initialData ? initialData.monitor : null],
      changeMonitorOption: [initialData ? initialData.changeMonitorOption : null],
      utilizers: utilizerArray,
    });

    this.courseDates.push(courseDateGroup);
    this.subscribeToFormChanges(courseDateGroup);
  }

  createUtilizer(utilizer: any, initialExtras: any[] = []): FormGroup {
    return this.fb.group({
      first_name: [utilizer.first_name],
      last_name: [utilizer.last_name],
      extras: [{value: initialExtras, disabled: !this.possibleExtras || !this.possibleExtras.length}], // Carga los extras iniciales
      totalExtraPrice: [0] // Para almacenar el precio total de los extras
    });
  }

  subscribeToFormChanges(courseDateGroup: FormGroup) {
    // Suscribirse a cambios en 'startHour'
    courseDateGroup.get('startHour').valueChanges.subscribe(() => {
      this.updateEndHour(courseDateGroup);

      if (this.course.is_flexible) {
        // Generar duraciones posibles basadas en la nueva 'startHour'
        this.possibleDurations = this.generateCourseDurations(courseDateGroup.get('startHour').value, this.course.hour_max);

        // Verificar si la duración actual está dentro de las posibles duraciones
        const currentDuration = courseDateGroup.get('duration').value;
        if (!this.possibleDurations.includes(currentDuration)) {
          // Si la duración no está en las posibles, setearla en null
          courseDateGroup.get('duration').setValue(null);
        }
        if(courseDateGroup.get('duration').value) {
          this.getMonitorsAvailable(courseDateGroup)
        }
      }
    });

    courseDateGroup.get('date').valueChanges.subscribe(() => {
      this.getMonitorsAvailable(courseDateGroup)
    });

    // Suscribirse a cambios en 'duration'
    courseDateGroup.get('duration').valueChanges.subscribe(() => {
      this.updateEndHour(courseDateGroup);

      const selectedDate = courseDateGroup.get('date').value;
      const newPrice = this.calculatePrice(selectedDate);

      // Actualizar el campo del precio con el nuevo cálculo
      courseDateGroup.get('price').setValue(newPrice);
      if(courseDateGroup.get('startHour').value) {
        if(courseDateGroup.get('duration').value) {
          this.getMonitorsAvailable(courseDateGroup)
        }
      }
    });

  }

  generateCourseDurations(startTime: any, endTime: any, interval: string = '15min') {

    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const formatMinutes = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours > 0 ? hours + 'h' : ''} ${minutes > 0 ? minutes + 'm' : ''}`.trim();
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    const intervalMatch = interval.match(/(\d+)(h|min)/g);
    let intervalTotalMinutes = 0;

    if (intervalMatch) {
      intervalMatch.forEach(part => {
        if (part.includes('h')) {
          intervalTotalMinutes += parseInt(part, 10) * 60;
        } else if (part.includes('min')) {
          intervalTotalMinutes += parseInt(part, 10);
        }
      });
    } else {
      console.error("Interval format is not correct.");
      return [];
    }

    const durations = [];
    for (let minutes = startMinutes + intervalTotalMinutes; minutes <= endMinutes; minutes += 5) {
      durations.push(formatMinutes(minutes - startMinutes));
    }

    const tableDurations = [];
    const tablePaxes = [];

    const priceRangeCourse = typeof this.course.price_range === 'string' ? JSON.parse(this.course.price_range) : this.course.price_range;
    durations.forEach(element => {
      const priceRange = priceRangeCourse ? priceRangeCourse.find((p) => p.intervalo === element) : null;
      if (priceRange && priceRange.intervalo === element) {

        if (this.extractValues(priceRange)[0] && (+this.extractValues(priceRange)[0].key) <= this.course.max_participants) {
          tableDurations.push(this.extractValues(priceRange)[0].interval);



          this.extractValues(priceRange).forEach(element => {
            const pax = element.key;

            if (pax && tablePaxes.length === 0 || pax && tablePaxes.length > 0 && !tablePaxes.find((p) => p === pax)) {
              tablePaxes.push(element.key);
            }
          });
        }

      }
    });

    return tableDurations;

  }

  extractValues(data: any): { key: string, value: string, interval: string }[] {
    let results = [];

    for (const key in data) {
      if (data.hasOwnProperty(key) && data[key] != null && key !== "intervalo") {
        results.push({ key: key, value: data[key], interval: data["intervalo"] });
      }
    }

    return results;
  }

  calculateAvailableHours(dateGroup: any, hour: string, index: number): boolean {
    // Obtén la fecha seleccionada y el rango de horas disponibles
    const selectedDate = moment( dateGroup.get('date').value).format('YYYY-MM-DD');
    const startHour = this.course.hour_min;
    const endHour = this.course.hour_max;

    // Verificar si startHour y endHour son válidos
    if (!startHour || !endHour) {
      return false; // Si no hay horas de inicio o fin, no desactiva ninguna opción
    }

    // Obtener la hora en formato HH:mm
    const selectedHour = moment(`${selectedDate} ${hour}`, 'YYYY-MM-DD HH:mm');

    // Combinar la fecha seleccionada con startHour y endHour para formar fechas completas
    const start = moment(`${selectedDate} ${startHour}`, 'YYYY-MM-DD HH:mm');
    const end = moment(`${selectedDate} ${endHour}`, 'YYYY-MM-DD HH:mm');

    // Verificar si la fecha seleccionada es hoy
    if (moment(selectedDate).isSame(moment(), 'day')) {
      // Si la fecha seleccionada es hoy, desactiva horas pasadas
      const now = moment().format('HH:mm');
      const nowMoment = moment(`${selectedDate} ${now}`, 'YYYY-MM-DD HH:mm');
      if (selectedHour.isBefore(nowMoment, 'minute')) {
        return true; // Desactivar la opción si la hora es anterior al momento actual
      }
    }

    // Verificar si la hora está dentro del rango permitido
    if (selectedHour.isBefore(start) || selectedHour.isAfter(end)) {
      return true; // Desactivar la opción si la hora está fuera del rango
    }

    // Aquí puedes agregar más validaciones específicas si es necesario

    return false; // La hora es válida si no se desactiva
  }

  private calculatePrice(date) {
    let total = 0;

    if (this.course.is_flexible) {
      // Calcula el precio basado en el intervalo y el número de utilizadores para cada fecha

      const duration = date.duration; // Duración de cada fecha
      const selectedUtilizers = this.utilizers.length; // Número de utilizadores

      // Encuentra el intervalo de duración que se aplica
      const interval = this.course.price_range.find(range => {
        return range.intervalo === duration; // Comparar con la duración de la fecha
      });

      if (interval) {
        total += parseFloat(interval[selectedUtilizers]); // Precio por utilizador para cada fecha
      }

    } else {
      // Si el curso no es flexible
      const dateTotal = parseFloat(this.course.price) * this.utilizers.length; // Precio por número de utilizadores
      total += dateTotal;

    }

    return total;
  }

  get courseDates(): FormArray {
    return this.stepForm.get("course_dates") as FormArray;
  }

  getUtilizersArray(dateIndex: number): FormArray {
    return this.courseDates.at(dateIndex).get('utilizers') as FormArray;
  }

  removeDate(index: number) {
    if (this.courseDates.length > 0) {
      this.courseDates.removeAt(index); // Utiliza removeAt para eliminar una fecha del FormArray
    }
  }

  isRow1Complete(index: number): boolean {
    const dateGroup = this.courseDates.at(index) as FormGroup;
    const date = dateGroup.get('date')?.value;
    const startHour = dateGroup.get('startHour')?.value;
    const duration = dateGroup.get('duration')?.value;
    return date && startHour && duration;
  }

  updateEndHour(courseDateGroup: FormGroup) {
    const startHour = courseDateGroup.get('startHour').value;
    const duration = courseDateGroup.get('duration').value;

    if (startHour && duration) {
      const endHour = this.calculateEndHour(startHour, duration);
      courseDateGroup.get('endHour').setValue(endHour, { emitEvent: false });
      console.log(endHour);
    }
  }

  getMaxDate() {
    return moment(this.course.course_dates[this.course.course_dates.length - 1].date).toDate();
  }

  generateCourseHours(startTime: string, endTime: string, mainDuration: string, interval: string): string[] {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const intervalParts = interval.split(' ');
    const mainDurationParts = mainDuration.split(' ');

    let intervalHours = 0;
    let intervalMinutes = 0;
    let mainDurationHours = 0;
    let mainDurationMinutes = 0;

    intervalParts.forEach(part => {
      if (part.includes('h')) {
        intervalHours = parseInt(part, 10);
      } else if (part.includes('min')) {
        intervalMinutes = parseInt(part, 10);
      }
    });

    mainDurationParts.forEach(part => {
      if (part.includes('h')) {
        mainDurationHours = parseInt(part, 10);
      } else if (part.includes('min')) {
        mainDurationMinutes = parseInt(part, 10);
      }
    });

    let currentHours = startHours;
    let currentMinutes = startMinutes;
    const result = [];

    while (true) {
      let nextIntervalEndHours = currentHours + mainDurationHours;
      let nextIntervalEndMinutes = currentMinutes + mainDurationMinutes;

      nextIntervalEndHours += Math.floor(nextIntervalEndMinutes / 60);
      nextIntervalEndMinutes %= 60;

      if (nextIntervalEndHours > endHours || (nextIntervalEndHours === endHours && nextIntervalEndMinutes > endMinutes)) {
        break;
      }

      result.push(`${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`);

      currentMinutes += intervalMinutes;
      currentHours += intervalHours + Math.floor(currentMinutes / 60);
      currentMinutes %= 60;

      if (currentHours > endHours || (currentHours === endHours && currentMinutes >= endMinutes)) {
        break;
      }
    }

    return result;
  }

  calculateEndHour(hour: any, duration: any) {
    if(duration.includes('h') && (duration.includes('min') || duration.includes('m'))) {
      const hours = duration.split(' ')[0].replace('h', '');
      const minutes = duration.split(' ')[1].replace('min', '').replace('m', '');

      return moment(hour, 'HH:mm').add(hours, 'h').add(minutes, 'm').format('HH:mm');
    } else if(duration.includes('h')) {
      const hours = duration.split(' ')[0].replace('h', '');

      return moment(hour, 'HH:mm').add(hours, 'h').format('HH:mm');
    } else {
      const minutes = duration.split(' ')[0].replace('min', '').replace('m', '');

      return moment(hour, 'HH:mm').add(minutes, 'm').format('HH:mm');
    }
  }

  setupExtrasValueChanges() {
    // Iteramos sobre las fechas
    this.courseDates.controls.forEach((dateGroup: FormGroup, dateIndex: number) => {
      // Iteramos sobre los utilizadores de cada fecha
      const utilizersArray = this.getUtilizersArray(dateIndex);
      utilizersArray.controls.forEach((utilizerGroup: FormGroup, utilizerIndex: number) => {
        // Nos suscribimos al control 'extras' para detectar cambios
        const extrasControl = utilizerGroup.get('extras') as FormArray;
        extrasControl.valueChanges.subscribe((selectedExtras) => {
          // Recalcula el precio total de los extras
          const totalExtraPrice = this.calculateTotalExtraPrice(selectedExtras);
          // Actualiza el campo totalExtraPrice del utilizador
          utilizerGroup.get('totalExtraPrice').setValue(totalExtraPrice, { emitEvent: false });
        });
      });
    });
  }

  calculateTotalExtraPrice(selectedExtras: any[]): number {
    let total = 0;
    selectedExtras.forEach(extra => {
      total += Number(extra.price); // Asegúrate de que el precio sea un número
    });
    return total;
  }

  getMonitorsAvailable(dateGroup) {
    const index = this.courseDates.controls.indexOf(dateGroup);

    const rq = {
      sportId: this.course.sport_id,
      minimumDegreeId: this.sportLevel.id,
      startTime: dateGroup.get('startHour').value,
      endTime: this.calculateEndHour(dateGroup.get('startHour').value, dateGroup.get('duration').value),
      date: moment( dateGroup.get('date').value).format('YYYY-MM-DD'),
      clientIds: this.utilizers.map(utilizer => utilizer.id)
    };
    this.crudService.post("/admin/monitors/available", rq).subscribe((data) => {
      this.possibleMonitors[index] = data.data;
      if (data.data.length === 0) {
        this.snackbar.open(this.translateService.instant('snackbar.booking.no_match'),
          'OK', {duration:3000});
      }
    });
  }
}
