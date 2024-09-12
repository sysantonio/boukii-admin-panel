import {Component, DoCheck, OnChanges, OnDestroy} from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';
import {CalendarService} from '../../../../../../../service/calendar.service';
import moment from 'moment';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'custom-header',
  template: `
    <div class="custom-header">
      <button mat-icon-button *ngIf="showPreviousButton" (click)="previousClicked()" class="previous">
        <span class="material-icons">chevron_left</span>
      </button>
      <span class="month-label">{{ currentMonthAndYear }}</span>
      <button mat-icon-button (click)="nextClicked()" class="next">
        <span class="material-icons">chevron_right</span>
      </button>
    </div>
  `,
  styles: [`
    .custom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class CustomHeader implements OnChanges, DoCheck{

  showPreviousButton: boolean = true;
  currentMonthAndYear: string;
  constructor(
    private calendar: MatCalendar<any>,
    private dateAdapter: DateAdapter<any>,
    private calendarService: CalendarService,
    private translateService: TranslateService
  ) {
    moment.locale(this.setLocale(this.translateService.getDefaultLang()));
    this.updateHeader();
  }

  ngOnChanges() {
    this.updateHeader();
  }

  ngDoCheck() {
    this.updateHeader();
  }

  updateHeader() {
    const currentDate = moment();
    const activeDate = moment(this.calendar.activeDate);

    this.showPreviousButton = activeDate.isAfter(currentDate, 'month');

    this.currentMonthAndYear = activeDate.format('MMMM');
  }

  getFirstDayOfMonth(date: any): Date {
    return this.dateAdapter.createDate(
      this.dateAdapter.getYear(date),
      this.dateAdapter.getMonth(date),
      1
    );
  }

  previousClicked() {
    const newDate = this.dateAdapter.addCalendarMonths(this.calendar.activeDate, -1);
    this.calendar.activeDate = newDate;
    this.calendarService.notifyMonthChanged(this.getFirstDayOfMonth(newDate));
  }

  nextClicked() {
    const newDate = this.calendar.activeDate
    this.calendarService.notifyMonthChanged(this.getFirstDayOfMonth(newDate));
  }


  setLocale(lang: string) {
    let locale;

    // Establece el locale basado en el idioma
    switch (lang) {
      case 'it':
        locale = 'it-IT';
        break;
      case 'en':
        locale = 'en-GB';
        break;
      case 'es':
        locale = 'es';
        break;
      case 'de':
        locale = 'de';
        break;
      case 'fr':
        locale = 'fr';
        break;
      default:
        locale = 'en-GB';
    }
    return locale
  }
}
