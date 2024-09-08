
import { Injectable } from '@angular/core';
import { ApiCrudService } from './crud.service';
import moment from 'moment';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {


  constructor(private translateService: TranslateService) {
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
      return "No durations found";
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


  parseDateToDay(date:any, inFormat: string, format: string) {
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

