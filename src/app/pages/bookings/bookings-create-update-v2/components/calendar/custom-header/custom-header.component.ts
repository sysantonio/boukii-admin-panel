import {Component, DoCheck, OnChanges, OnDestroy} from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';
import {CalendarService} from '../../../../../../../service/calendar.service';
import moment from 'moment';


@Component({
  selector: 'custom-header',
  template: `
    <div class="custom-header">
      <button mat-icon-button *ngIf="showPreviousButton" (click)="previousClicked()">
        <span class="material-icons">chevron_left</span>
      </button>
      <button mat-icon-button (click)="nextClicked()">
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
    private calendarService: CalendarService
  ) {
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

    this.currentMonthAndYear = activeDate.format('MMMM YYYY');
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
    const newDate = this.dateAdapter.addCalendarMonths(this.calendar.activeDate, 1);
    this.calendar.activeDate = newDate;
    this.calendarService.notifyMonthChanged(this.getFirstDayOfMonth(newDate));
  }
}
