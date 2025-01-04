
import { Injectable } from '@angular/core';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  constructor(private translateService: TranslateService, private fb: UntypedFormBuilder) { }
  courseFormGroup: UntypedFormGroup;

  resetcourseFormGroup() {
    this.courseFormGroup = this.fb.group({
      id: [null, Validators.required],
      sport_id: [null, Validators.required],
      is_flexible: [false],
      created_at: [null],
      user: [null],
      course_type: [null, Validators.required],
      name: ["PROBANDO", Validators.required],
      short_description: ["PROBANDO RESUMEN", Validators.required],
      description: ["PROBANDO DESCRIPCION", Validators.required],
      price: [100, [Validators.required, Validators.min(1)]],
      currency: ['CHF'],
      max_participants: [10, [Validators.required, Validators.min(1)]],
      image: ["", Validators.required],
      icon: ["", Validators.required],
      age_max: [99, [Validators.required, Validators.min(0), Validators.max(99)]],
      age_min: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
      date_start: [, Validators.required],
      date_end: [, Validators.required],
      date_start_res: [],
      date_end_res: [],
      duration: [, Validators.required], //2
      confirm_attendance: [false],
      active: [true],
      online: [true],
      options: [true],
      translations: [
        {
          es: {
            name: '',
            short_description: '',
            description: ''
          },
          en: {
            name: '',
            short_description: '',
            description: ''
          },
          fr: {
            name: '',
            short_description: '',
            description: ''
          },
          it: {
            name: '',
            short_description: '',
            description: ''
          },
          de: {
            name: '',
            short_description: '',
            description: ''
          },
        }
      ],
      school_id: [null],
      station_id: [null],
      course_dates: [[], Validators.required],
      discounts: [null, Validators.required],
      unique: [true],
      hour_min: [],
      hour_max: [],
      price_range: [[]],
      extras: [[], Validators.required],
      levelGrop: [[], Validators.required],
      settings: [
        {
          weekDays: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
          },
          periods: [],
          groups: []
        }
      ],
    });
  }


  getCourseName(course: any) {
    if (!course.translations) {
      return course.name;
    } else {
      const translations = JSON.parse(course.translations);
      return translations[this.translateService.currentLang].name !== null && translations[this.translateService.currentLang].name !== '' ? translations[this.translateService.currentLang].name : course.name;
    }
  }

  getShortDescription(course: any) {

    if (!course.translations) {
      return course.short_description;
    } else {
      const translations = JSON.parse(course.translations);
      return translations[this.translateService.currentLang].short_description !== null && translations[this.translateService.currentLang].short_description !== '' ? translations[this.translateService.currentLang].short_description : course.short_description;
    }
  }

  getDescription(course: any) {

    if (!course.translations) {
      return course.description;
    } else {
      const translations = JSON.parse(course.translations);
      return translations[this.translateService.currentLang].description !== null && translations[this.translateService.currentLang].description !== '' ? translations[this.translateService.currentLang].description : course.description;
    }
  }

  getShortestDuration(times) {
    let shortest = null;

    times.forEach(time => {
      const start = moment(time.hour_start, "HH:mm:ss");
      const end = moment(time.hour_end, "HH:mm:ss");
      const duration = moment.duration(end.diff(start));

      if (shortest === null || duration < shortest) {
        shortest = duration;
      }
    });

    if (shortest !== null) {
      const hours = shortest.hours();
      const minutes = shortest.minutes();
      return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'min' : ''}`.trim();
    } else {
      return "No_durations_found";
    }
  }

  getAgeRange(data: any[]): { age_min: number, age_max: number } {
    let age_min = Number.MAX_SAFE_INTEGER;
    let age_max = Number.MIN_SAFE_INTEGER;

    data.forEach(item => {
      if (item.age_min < age_min) {
        age_min = item.age_min;
      }
      if (item.age_max > age_max) {
        age_max = item.age_max;
      }
    });

    return { age_min, age_max };
  }


  parseDateToDay(date: any, inFormat: string, format: string) {
    return moment(date, inFormat).format(format);
  }


  findFirstCombinationWithValues(data: any) {
    if (data !== null) {
      for (const intervalo of data) {
        // Usamos Object.values para obtener los valores del objeto y Object.keys para excluir 'intervalo'
        if (Object.keys(intervalo).some(key => key !== 'intervalo' && intervalo[key] !== null)) {
          return intervalo;
        }
      }
      return null; // Devuelve null si no encuentra ninguna combinación válida
    }

  }

  encontrarPrimeraClaveConValor(obj: any): string | null {
    if (obj !== null) {
      for (const clave of Object.keys(obj)) {
        if (obj[clave] !== null && clave !== 'intervalo') {
          return obj[clave];
        }
      }
      return null;
    }

  }
}

