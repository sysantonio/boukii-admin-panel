import { Injectable } from "@angular/core";
import moment from "moment";
import { MOCK_COUNTRIES } from "src/app/static-data/countries-data";
import {Observable, of, tap} from 'rxjs';
import {ApiCrudService} from './crud.service';
import {MatCalendarCellCssClasses} from '@angular/material/datepicker';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: "root",
})
export class UtilsService {
  private countries = MOCK_COUNTRIES;
  season: any = [];
  holidays: any = [];

  constructor(private crudService: ApiCrudService, private translateService: TranslateService) {}

  calculateYears(birthDateString: string) {
    const fechaActual = moment();
    const age = fechaActual.diff(
      moment(birthDateString, "dd.MM.yyyy"),
      "years"
    );
    return age;
  }

  getSportLevels(id: any, allLevels:any) {
    return allLevels.filter((a) => a.sport_id === id)
  }

  getCountry(id: any) {
    const country = this.countries.find((c) => c.id == id);
    return country ? country.name : "NDF";
  }

  formatDate(date: string, format = "dd.MM.yyyy") {
    return moment(date).format(format);
  }

  getSchoolData() {
    const user = JSON.parse(localStorage.getItem("boukiiUser"));
    return user.schools[0]
  }

  getSeason(schoolId: number): Observable<any> {
    // Si ya tenemos la temporada, devolverla directamente
    if (this.season) {
      return of(this.season); // Devuelve un Observable con la temporada almacenada
    }

    // Si no está almacenada, hacemos la llamada a la API
    return this.crudService
      .list('/seasons', 1, 10000, 'asc', 'id', '&school_id=' + schoolId + '&is_active=1')
      .pipe(
        tap((response) => {
          this.season = response.data[0]; // Guardamos la temporada en caché
          this.holidays = this.season.vacation_days ? JSON.parse(this.season.vacation_days) : [];
        })
      );
  }

  // Método adicional para obtener las vacaciones
  getHolidays(): any[] {
    return this.holidays;
  }

  getAvailableWeekDays(settings: any): string | null {
    if (settings !== null) {
      const data = typeof settings === 'string' ? JSON.parse(settings) : settings;

      const dayTranslations = {
        monday: this.translateService.instant('Lundi'), // Traducción para Monday
        tuesday: this.translateService.instant('Mardi'), // Traducción para Tuesday
        wednesday: this.translateService.instant('Mercredi'), // Traducción para Wednesday
        thursday: this.translateService.instant('Jeudi'), // Traducción para Thursday
        friday: this.translateService.instant('Vendredi'), // Traducción para Friday
        saturday: this.translateService.instant('Samedi'), // Traducción para Saturday
        sunday: this.translateService.instant('Diamanche'), // Traducción para Sunday
      };

      let ret = null;

      if (data !== null) {
        Object.keys(data.weekDays).forEach((day) => {
          if (data.weekDays[day] && dayTranslations[day]) {
            ret = ret === null ? dayTranslations[day] : `${ret} - ${dayTranslations[day]}`;
          }
        });
      }

      return ret;
    }

    return null;
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

  calculateAvailableHours(date: any, hour: string, course: any): boolean {
    // Obtén la fecha seleccionada y el rango de horas disponibles
    const selectedDate = moment(date).format('DD.MM.yyyy');
    const startHour = course.hour_min;
    const endHour = course.hour_max;

    // Verificar si startHour y endHour son válidos
    if (!startHour || !endHour) {
      return false; // Si no hay horas de inicio o fin, no desactiva ninguna opción
    }

    // Obtener la hora en formato HH:mm
    const selectedHour = moment(`${selectedDate} ${hour}`, 'dd.MM.yyyy HH:mm');

    // Combinar la fecha seleccionada con startHour y endHour para formar fechas completas
    const start = moment(`${selectedDate} ${startHour}`, 'dd.MM.yyyy HH:mm');
    const end = moment(`${selectedDate} ${endHour}`, 'dd.MM.yyyy HH:mm');

    // Verificar si la fecha seleccionada es hoy
    if (moment(selectedDate).isSame(moment(), 'day')) {
      // Si la fecha seleccionada es hoy, desactiva horas pasadas
      const now = moment().format('HH:mm');
      const nowMoment = moment(`${selectedDate} ${now}`, 'dd.MM.yyyy HH:mm');
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
  dateClass(color: string, course: any, minDate:any) {
    return (date: Date): MatCalendarCellCssClasses => {
      const currentDate = moment(date, "dd.MM.yyyy").format("dd.MM.yyyy");
      if (
        course.course_dates.find(s => moment(s.date).format('DD.MM.yyyy') === currentDate) &&
        moment(minDate, "dd.MM.yyyy")
          .startOf("day")
          .isSameOrBefore(moment(date, "dd.MM.yyyy").startOf("day"))
      ) {
        return `with-course ${color}`;
      } else {
        return;
      }
    };
  }

  inUseDatesFilter = (d: Date, myHolidayDates:any, course:any, allowPast = false): boolean => {
    if (!d) return false; // Si la fecha es nula o indefinida, no debería ser seleccionable.

    const formattedDate = moment(d).format('DD.MM.yyyy');
    const time = moment(d).startOf('day').valueOf(); // .getTime() es igual a .valueOf()
    const today = moment().startOf('day'); // Fecha actual (sin hora, solo día)

    // Verifica si la fecha es anterior a hoy.
    const isPastDate = allowPast ? !allowPast : moment(d).isBefore(today);

    // Encuentra si la fecha actual está en myHolidayDates.
    const isHoliday = myHolidayDates.some(x => x.getTime() === time);

    // Encuentra si la fecha actual está en selectedItem.course_dates y si es activa.
    const courseDate = course.course_dates.find(s => moment(s.date).format('DD.MM.yyyy') === formattedDate);
    const isActive = courseDate ? (courseDate.active || courseDate.active === 1) : false;

    // La fecha debería ser seleccionable si no es un día festivo y está activa (o sea, active no es falso ni 0).
    return !isHoliday && isActive && !isPastDate;
  }

  generateCourseDurations(startTime: any, endTime: any, course: any, interval: string = '15min') {

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

    const priceRangeCourse = typeof course.price_range === 'string' ? JSON.parse(course.price_range) :
      course.price_range;
    durations.forEach(element => {
      const priceRange = priceRangeCourse ? priceRangeCourse.find((p) => p.intervalo === element) : null;
      if (priceRange && priceRange.intervalo === element) {

        if (this.extractValues(priceRange)[0] && (+this.extractValues(priceRange)[0].key) <= course.max_participants) {
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

  extractValues(data: any): { key: string, value: string, interval: string }[] {
    let results = [];

    for (const key in data) {
      if (data.hasOwnProperty(key) && data[key] != null && key !== "intervalo") {
        results.push({ key: key, value: data[key], interval: data["intervalo"] });
      }
    }

    return results;
  }

  getClientDegreeByClient(client: any, sport_id: number) {
    if (client && client !== null && sport_id && sport_id !== null) {
      const sportObject = client?.client_sports.find(
        (obj) => obj.sport_id === sport_id && obj.school_id == this.getSchoolData().id
      );

      return sportObject?.degree_id;
    }
  }

}
