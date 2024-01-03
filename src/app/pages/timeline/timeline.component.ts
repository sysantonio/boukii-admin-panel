import { Component } from '@angular/core';
import { addDays, getDay, startOfWeek, endOfWeek, addWeeks, subWeeks, format, isSameMonth, startOfMonth, endOfMonth, addMonths, subMonths, max, min } from 'date-fns';
import { ApiCrudService } from 'src/service/crud.service';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../monitors/monitor-detail/confirm-dialog/confirm-dialog.component';
import { CalendarEditComponent } from '../monitors/monitor-detail/calendar/calendar-edit/calendar-edit.component';
import { EventService } from 'src/service/event.service';
import * as moment from 'moment';
import 'moment/locale/fr';
import { CourseDetailComponent } from '../courses/course-detail/course-detail.component';
import { CourseDetailModalComponent } from '../courses/course-detail-modal/course-detail-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingsCreateUpdateModalComponent } from '../bookings/bookings-create-update-modal/bookings-create-update-modal.component';
import { BookingDetailModalComponent } from '../bookings/booking-detail-modal/booking-detail-modal.component';
import { CourseUserTransferComponent } from '../courses/course-user-transfer/course-user-transfer.component';
import { CourseUserTransferTimelineComponent } from './course-user-transfer-timeline/course-user-transfer-timeline.component';
import { TranslateService } from '@ngx-translate/core';
moment.locale('fr');

@Component({
  selector: 'vex-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent {

  hoursRange: string[];
  hoursRangeMinusLast:string[];
  hoursRangeMinutes: string[];

  monitorsForm:any[];

  loadingMonitors = true;

  tasksCalendarStyle: any[];
  filteredTasks: any[];
  currentDate = new Date();
  timelineView: string = 'day';
  currentWeek: string = '';
  weekDays: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  currentMonth: string = '';
  weeksInMonth: any[] = [];

  allMonitors:any[] =[];
  filteredMonitors:any[] =[];
  plannerTasks:any[] =[];
  vacationDays:any[];

  user:any=null;
  activeSchool:any=null;
  languages:any[] = [];
  sports:any[] = [];
  sportsReceived:any[] = [];
  degrees:any[] = [];
  showGrouped:boolean=false;
  groupedTasks:any[] = [];
  idGroupedTasks:any;
  hourGrouped:any;
  dateGrouped:any;
  showDetail:boolean=false;
  idDetail:any;
  hourDetail:any;
  dateDetail:any;
  monitorDetail:any;
  subgroupDetail:any;
  taskDetail:any;
  showBlock:boolean=false;
  idBlock:any;
  blockDetail:any;
  imagePath = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';
  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  mockLevels = LEVELS;

  showEditMonitor:boolean = false;
  editedMonitor:any;
  moveTask:boolean=false;
  taskMoved:any;
  showEditBlock:boolean = false;

  showFilter:boolean=false;
  checkedSports = new Set();
  filterMonitor:any=null;
  filterFree:boolean=true;
  filterOccupied:boolean=true;
  filterCollective:boolean=true;
  filterPrivate:boolean=true;
  filterNwd:boolean=true;
  filterBlockPayed:boolean=true;
  filterBlockNotPayed:boolean=true;

  allHoursDay:boolean=false;
  startTimeDay:string;
  endTimeDay:string;
  nameBlockDay:string;
  divideDay:boolean=false;
  startTimeDivision:string;
  endTimeDivision:string;
  searchDate:any;

  constructor(private crudService: ApiCrudService,private dialog: MatDialog,private translateService: TranslateService, private snackbar: MatSnackBar) {
    this.mockLevels.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);
  }

  async ngOnInit() {
    this.activeSchool = await this.getUser();
    await this.getLanguages();
    await this.getSports();
    await this.getSchoolSports();
    await this.getDegrees();
    this.crudService.list('/seasons', 1, 10000, 'asc', 'id', '&school_id='+this.user.schools[0].id+'&is_active=1')
      .subscribe((season) => {
        let hour_start = '08:00';
        let hour_end = '18:00';
        if (season.data.length > 0) {
          this.vacationDays = JSON.parse(season.data[0].vacation_days);
          hour_start = season.data[0].hour_start ? season.data[0].hour_start.substring(0, 5) : '08:00';
          hour_end = season.data[0].hour_end ? season.data[0].hour_end.substring(0, 5) : '18:00';
        }
        this.hoursRange = this.generateHoursRange(hour_start, hour_end);
        this.hoursRangeMinusLast = this.hoursRange.slice(0, -1);
        this.hoursRangeMinutes = this.generateHoursRangeMinutes(hour_start, hour_end);
      })

    await this.calculateWeeksInMonth();
    //await this.calculateTaskPositions();
    this.loadBookings(this.currentDate);
  }

  onDateChange() {
    this.currentDate = this.searchDate;
    this.timelineView === 'day';
    this.updateView();
  }

  async getUser() {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    const activeSchool = this.user.schools.find(school => school.active === true);
    if (activeSchool) {
        return activeSchool.id;
    } else {
        return null;
    }
  }

  async getLanguages() {
    try {
      const data: any = await this.crudService.get('/languages?&perPage='+99999).toPromise();
      this.languages = data.data;
    } catch (error) {
    }
  }

  async getSports(){
    try {
      const data: any = await this.crudService.get('/sports?perPage='+99999).toPromise();
      this.sportsReceived = data.data;
    } catch (error) {
    }
  }

  async getSchoolSports(){
    try {
      const data: any = await this.crudService.get('/school-sports?school_id='+this.activeSchool+'&perPage='+99999).toPromise();
      this.sports = this.sportsReceived.filter(sport =>
        data.data.some(newSport => newSport.sport_id === sport.id)
      );
      this.sports.forEach(sport => this.checkedSports.add(sport.id));
    } catch (error) {
    }
  }

  async getDegrees(){
    try {
      const data: any = await this.crudService.get('/degrees?school_id='+this.activeSchool+'&perPage='+99999).toPromise();

      this.degrees = data.data.sort((a, b) => a.degree_order - b.degree_order);
      this.degrees.forEach((degree: any) => {
        degree.inactive_color = this.lightenColor(degree.color, 30);
      });
    } catch (error) {
    }
  }

  private lightenColor(hexColor: string, percent: number): string {
    let r:any = parseInt(hexColor.substring(1, 3), 16);
    let g:any = parseInt(hexColor.substring(3, 5), 16);
    let b:any = parseInt(hexColor.substring(5, 7), 16);

    // Increase the lightness
    r = Math.round(r + (255 - r) * percent / 100);
    g = Math.round(g + (255 - g) * percent / 100);
    b = Math.round(b + (255 - b) * percent / 100);

    // Convert RGB back to hex
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');

    return '#'+r+g+b;
  }

  goToPrevious() {
    if (this.timelineView === 'day') {
      this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() - 1));
    } else if (this.timelineView === 'week') {
      this.currentDate = subWeeks(this.currentDate, 1);
    } else if (this.timelineView === 'month') {
      this.currentDate = subMonths(this.currentDate, 1);
    }
    this.updateView();
  }

  goToNext() {
    if (this.timelineView === 'day') {
      this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + 1));
    } else if (this.timelineView === 'week') {
      this.currentDate = addWeeks(this.currentDate, 1);
    } else if (this.timelineView === 'month') {
      this.currentDate = addMonths(this.currentDate, 1);
    }
    this.updateView();
  }

  changeView(newView: string) {
    this.timelineView = newView;
    this.updateView();
  }

  updateView() {
    if (this.timelineView === 'week') {
      const start = startOfWeek(this.currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(this.currentDate, { weekStartsOn: 1 });
      this.currentWeek = `${format(start, 'dd')} - ${format(end, 'dd MMMM yyyy')}`;
    } else if (this.timelineView === 'month') {
      this.currentMonth = format(this.currentDate, 'MMMM yyyy');
      this.calculateWeeksInMonth();
    } else {
      this.currentWeek = '';
    }
    this.loadBookings(this.currentDate);
  }

  loadBookings(date: Date) {
    let firstDate, lastDate;
    if (this.timelineView === 'week') {
      const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 });
      const endOfWeekDate = endOfWeek(date, { weekStartsOn: 1 });
      firstDate = moment(startOfWeekDate).format('YYYY-MM-DD');
      lastDate = moment(endOfWeekDate).format('YYYY-MM-DD');
      this.searchBookings(firstDate,lastDate);

      /*this.filteredTasks = this.tasksCalendarStyle.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= startOfWeekDate && taskDate <= endOfWeekDate;
      });*/
    } else if (this.timelineView === 'month') {
      const startMonth = startOfMonth(date);
      const endMonth = endOfMonth(date);
      firstDate = moment(startMonth).format('YYYY-MM-DD');
      lastDate = moment(endMonth).format('YYYY-MM-DD');
      this.searchBookings(firstDate,lastDate);

      /*this.filteredTasks = this.tasksCalendarStyle.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= startMonth && taskDate <= endMonth;
      });*/
    } else {
      const dateStr = date.toISOString().split('T')[0];
      firstDate = moment(date).format('YYYY-MM-DD');
      lastDate = firstDate;
      this.searchBookings(firstDate,lastDate);
      /*this.filteredTasks = this.tasksCalendarStyle.filter(task => task.date === dateStr);*/
    }
  }

  searchBookings(firstDate:string,lastDate:string){
    this.crudService.get('/admin/getPlanner?date_start='+firstDate+'&date_end='+lastDate+'&school_id='+this.activeSchool+'&perPage='+99999).subscribe(
      (data:any) => {
        this.processData(data.data);
      },
      error => {
      }
    );
  }

  normalizeToArray(data:any) {
    //Nwds sometimes as object sometimes as array
    if (Array.isArray(data)) {
      return data;
    }
    if (typeof data === 'object') {
      return Object.values(data);
    }
    return [];
  }

  processData(data:any) {
    this.allMonitors = [{
        id: null
    }];
    if(this.filterMonitor){
      this.filteredMonitors = [];
    }
    else{
      this.filteredMonitors = [{
        id: null
      }];
    }
    let allNwds = [];
    let allBookings = [];

    for (const key in data) {
        const item = data[key];
        let hasAtLeastOne = true;

        // Save all monitors
        if (item.monitor) {
          if(!this.areAllChecked()){
            hasAtLeastOne = item.monitor.sports.length > 0 && item.monitor.sports.some(sport => this.checkedSports.has(sport.id));
          }
          this.allMonitors.push(item.monitor);
        }

        // Process 'monitor' field
        if(this.filterMonitor){
          if (item.monitor && item.monitor.id == this.filterMonitor && hasAtLeastOne && item.monitor.sports.length > 0) {
            this.filteredMonitors.push(item.monitor);
          }
        }
        else{
          if (item.monitor && hasAtLeastOne && item.monitor.sports.length > 0) {
            this.filteredMonitors.push(item.monitor);
          }
        }

        // Process 'nwds' field
        if (item.nwds) {
          const nwdsArray = this.normalizeToArray(item.nwds);
          if(this.filterMonitor && hasAtLeastOne){
            for (const nwd of nwdsArray) {
              if (nwd.monitor_id === this.filterMonitor) {
                if ((this.filterNwd || nwd.user_nwd_subtype_id !== 1) &&
                    (this.filterBlockPayed || nwd.user_nwd_subtype_id !== 2) &&
                    (this.filterBlockNotPayed || nwd.user_nwd_subtype_id !== 3)) {
                  allNwds.push(nwd);
                }
              } else {
                //If one doesn't match -> break loop
                break;
              }
            }
          }
          else {
            if(hasAtLeastOne){
              const filteredNwds = nwdsArray.filter(nwd =>
                (this.filterNwd || nwd.user_nwd_subtype_id !== 1) &&
                (this.filterBlockPayed || nwd.user_nwd_subtype_id !== 2) &&
                (this.filterBlockNotPayed || nwd.user_nwd_subtype_id !== 3)
              );
              allNwds.push(...filteredNwds);
            }
          }
        }

        let hasAtLeastOneBooking = true;

        // Process 'bookings' field
        /*NO NEED TO GROUP WHEN CHANGE IN CALL*/
        /*allBookings.push(...item.bookings);*/
        if (item.bookings && typeof item.bookings === 'object') {
            for (const bookingKey in item.bookings) {
                const bookingArray = item.bookings[bookingKey];
                if (Array.isArray(bookingArray) && bookingArray.length > 0) {
                  if(!this.areAllChecked()){
                    hasAtLeastOneBooking = this.checkedSports.has(bookingArray[0].course.sport_id);
                  }
                  if(this.filterMonitor && hasAtLeastOne && hasAtLeastOneBooking){
                    if(bookingArray[0].monitor_id == this.filterMonitor){
                      if ((this.filterCollective || bookingArray[0].course.course_type !== 1) &&
                          (this.filterPrivate || bookingArray[0].course.course_type !== 2)) {
                        const firstBooking = { ...bookingArray[0], bookings_number: bookingArray.length, bookings_clients: bookingArray };
                        allBookings.push(firstBooking);
                      }
                    }
                  }
                  else{
                    if(hasAtLeastOne && hasAtLeastOneBooking){
                      if ((this.filterCollective || bookingArray[0].course.course_type !== 1) &&
                          (this.filterPrivate || bookingArray[0].course.course_type !== 2)) {
                        const firstBooking = { ...bookingArray[0], bookings_number: bookingArray.length, bookings_clients: bookingArray };
                        allBookings.push(firstBooking);
                      }
                    }
                  }
                }
            }
        }
    }

    //Convert them into TASKS

    let tasksCalendar:any = [
      //BOOKINGS
      ...allBookings.map(booking => {
        let type;
        switch(booking.course.course_type) {
          case 1:
            type = 'collective';
            break;
          case 2:
            type = 'private';
            break;
          default:
            type = 'unknown';
        }

        const dateTotalAndIndex = booking.course.course_type === 2 ? { date_total: 0, date_index: 0 } : {
          date_total: booking.course.course_dates.length,
          date_index: this.getPositionDate(booking.course.course_dates, booking.course_date_id)
        };

        //Get Sport and Degree objects
        const sport = this.sports.find(s => s.id === booking.course.sport_id);
        const degrees_sport = this.degrees.filter(degree => degree.sport_id === booking.course.sport_id);
        let degree = {};
        if(type == 'collective'){
          degree = this.degrees.find(degree => degree.id === booking.degree_id) || degrees_sport[0];
        }
        else if(type == 'private'){
          const sportObject = booking.bookings_clients[0].client.sports.find(sport => sport.id === booking.course.sport_id);
          if (sportObject && sportObject.pivot && sportObject.pivot.degree_id) {
            degree = this.degrees.find(degree => degree.id === sportObject.pivot.degree_id);
          }
          if (!degree) {
            degree = degrees_sport[0];
          }
          degree = this.degrees.find(degree => degree.id === booking.degree_id) || degrees_sport[0];
        }

        let monitor = null;
        if(booking.monitor_id){
          monitor = this.filteredMonitors.find(monitor => monitor.id === booking.monitor_id) || null;
        }

        return {
          booking_id: booking?.booking.id,
          date: moment(booking.date).format('YYYY-MM-DD'),
          date_full: booking.date,
          date_start: moment(booking.course.date_start).format('DD/MM/YYYY'),
          date_end: moment(booking.course.date_end).format('DD/MM/YYYY'),
          hour_start: booking.hour_start.substring(0, 5),
          hour_end: booking.hour_end ? booking.hour_end.substring(0, 5) : this.hoursRange[this.hoursRange.length-1],
          type: type,
          name: booking.course.name,
          sport_id: booking.course.sport_id,
          sport: sport,
          degree_id: booking.degree_id,
          degree: degree,
          degrees_sport: degrees_sport,
          clients_number: booking.bookings_number,
          all_clients: booking.bookings_clients,
          max_participants: booking.course.max_participants,
          monitor_id: booking.monitor_id,
          monitor: monitor,
          course_id: booking.course_id,
          course_date_id: booking.course_date_id,
          course_subgroup_id: booking.course_subgroup_id,
          subgroup_number: booking.subgroup_number,
          total_subgroups: booking.total_subgroups,
          course: booking.course,
          ...dateTotalAndIndex
        };
      }),
      //NWDS -> for active_school
      ...allNwds.map(nwd => {
        let type;
        if (nwd.user_nwd_subtype_id === 1) {
            type = 'block_personal';
        } else if (nwd.user_nwd_subtype_id === 2) {
            type = 'block_payed';
        } else if (nwd.user_nwd_subtype_id === 3) {
            type = 'block_no_payed';
        } else {
            type = 'unknown';
        }
        const hourTimesNwd = nwd.full_day ? {
            hour_start: this.hoursRange[0],
            hour_end: this.hoursRange[this.hoursRange.length-1]
          } : {
          hour_start: nwd.start_time.substring(0, 5),
          hour_end: nwd.end_time.substring(0, 5)
        };

        let monitor = null;
        if(nwd.monitor_id){
          monitor = this.filteredMonitors.find(monitor => monitor.id === nwd.monitor_id) || null;
        }

        return {
          school_id: nwd.school_id,
          station_id: nwd.station_id,
          block_id: nwd.id,
          date: moment(nwd.start_date).format('YYYY-MM-DD'),
          date_format: moment(nwd.start_date).format('DD/MM/YYYY'),
          full_day: nwd.full_day,
          type: type,
          color: nwd.user_nwd_subtype_id === 1 ? '#bbbbbb' : nwd.color,
          name: nwd.description,
          monitor_id: nwd.monitor_id,
          monitor: monitor,
          user_nwd_subtype_id: nwd.user_nwd_subtype_id,
          color_block: nwd.color,
          start_date: nwd.start_date,
          end_date: nwd.end_date,
          ...hourTimesNwd
        };
      })
    ];

    this.calculateTaskPositions(tasksCalendar);
  }

  getPositionDate(courseDates: any[], courseDateId: string): number {
    const index = courseDates.findIndex(date => date.id === courseDateId);
    return index >= 0 ? index + 1 : 0;
  }

  async calculateWeeksInMonth() {
    const startMonth = startOfWeek(startOfMonth(this.currentDate), { weekStartsOn: 1 });
    const endMonth = endOfWeek(endOfMonth(this.currentDate), { weekStartsOn: 1 });

    this.weeksInMonth = [];
    let currentWeekStart = startMonth;

    while (currentWeekStart <= endMonth) {
      const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

      const week = {
        startWeek: format(currentWeekStart, 'yyyy-MM-dd'),
        startDay: this.formatDayWithFrenchInitial(max([startOfMonth(this.currentDate), currentWeekStart])),
        endDay: this.formatDayWithFrenchInitial(min([endOfMonth(this.currentDate), currentWeekEnd]))
      };

      this.weeksInMonth.push(week);
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }
  }

  formatDayWithFrenchInitial(date: Date): string {
    const frenchDayInitials = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
    const dayOfWeek = getDay(date);
    const initial = frenchDayInitials[dayOfWeek];
    return `${initial} ${format(date, 'd')}`;
  }

  isDayInMonth(dayIndex: number, weekIndex: number): boolean {
    const week = this.weeksInMonth[weekIndex];
    const weekStartDate = new Date(week.startWeek);
    const specificDate = addDays(weekStartDate, dayIndex);
    if(isSameMonth(specificDate, this.currentDate)){
      return !this.vacationDays.includes(moment(specificDate).format('YYYY-MM-DD'));
    }
    else{
      return false;
    }
  }

  isDayVisibleWeek(dayIndex:number){
    const startOfWeek = moment(this.currentDate).startOf('isoWeek');
    const specificDate = startOfWeek.add(dayIndex, 'days');
    return !this.vacationDays.includes(moment(specificDate).format('YYYY-MM-DD'));
  }

  isDayVisibleDay(){
    return !this.vacationDays.includes(moment(this.currentDate).format('YYYY-MM-DD'));
  }

  generateHoursRange(start: string, end: string): string[] {
    const startTime = this.parseTime(start);
    const endTime = this.parseTime(end);
    let currentTime = new Date(startTime);
    let times = [];

    while (currentTime <= endTime) {
      times.push(this.formatTime(currentTime));
      currentTime.setHours(currentTime.getHours() + 1);
    }

    return times;
  }

  generateHoursRangeMinutes(start: string, end: string): string[] {
    const startTime = this.parseTime(start);
    const endTime = this.parseTime(end);
    let currentTime = new Date(startTime);
    let times = [];

    while (currentTime <= endTime) {
      times.push(this.formatTime(currentTime));
      currentTime = new Date(currentTime.getTime() + 5 * 60000);
    }

    return times;
  }

 async calculateTaskPositions(tasks:any) {
    const pixelsPerMinute = 150 / 60;
    const pixelsPerMinuteWeek = 300 / ((this.hoursRange.length - 1) * 60);
    let plannerTasks = tasks.map((task:any) => {
      //Style for days

      //Check start time is inside hours range
      const firstTimeRange = this.parseTime(this.hoursRange[0]);
      const startTime = this.parseTime(task.hour_start);
      if (startTime < firstTimeRange) {
        startTime.setHours(firstTimeRange.getHours(), firstTimeRange.getMinutes(), 0, 0);
      }

      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const rangeStart = this.parseTime(this.hoursRange[0]);
      const rangeStartMinutes = rangeStart.getHours() * 60 + rangeStart.getMinutes();
      const leftMinutes = startMinutes - rangeStartMinutes;
      const leftPixels = leftMinutes * pixelsPerMinute;

      //Check end time is inside hours range
      const lastTimeRange = this.parseTime(this.hoursRange[this.hoursRange.length - 1]);
      const endTime = this.parseTime(task.hour_end);
      if (endTime > lastTimeRange) {
        endTime.setHours(lastTimeRange.getHours(), lastTimeRange.getMinutes(), 0, 0);
      }

      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
      const durationMinutes = endMinutes - startMinutes;
      const widthPixels = durationMinutes * pixelsPerMinute;

      const monitorIndex = this.filteredMonitors.findIndex(m => m.id === task.monitor_id);
      const topPixels = monitorIndex * 100;

      const style = {
        'left': `${leftPixels}px`,
        'width': `${widthPixels}px`,
        'top': `${topPixels}px`
      };

      //Style for weeks
      const taskDate = new Date(task.date);
      const dayOfWeek = taskDate.getDay();
      const initialLeftOffset = (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 300;

      const startTimeWeek = this.parseTime(task.hour_start);
      if (startTimeWeek < firstTimeRange) {
        startTimeWeek.setHours(firstTimeRange.getHours(), firstTimeRange.getMinutes(), 0, 0);
      }

      const rangeStartWeek = this.parseTime(this.hoursRange[0]);
      const startMinutesWeek = startTimeWeek.getHours() * 60 + startTimeWeek.getMinutes();
      const rangeStartMinutesWeek = rangeStartWeek.getHours() * 60 + rangeStartWeek.getMinutes();
      const leftMinutesWeek = startMinutesWeek - rangeStartMinutesWeek;
      const additionalLeftPixels = leftMinutesWeek * pixelsPerMinuteWeek;

      //Check end time is inside hours range
      const endTimeWeek = this.parseTime(task.hour_end);
      if (endTimeWeek > lastTimeRange) {
        endTimeWeek.setHours(lastTimeRange.getHours(), lastTimeRange.getMinutes(), 0, 0);
      }
      const endMinutesWeek = endTimeWeek.getHours() * 60 + endTimeWeek.getMinutes();
      const durationMinutesWeek = endMinutesWeek - startMinutesWeek;
      const widthPixelsWeek = durationMinutesWeek * pixelsPerMinuteWeek;

      const styleWeek = {
        'left': `${initialLeftOffset + additionalLeftPixels}px`,
        'width': `${widthPixelsWeek}px`,
        'top': `${topPixels}px`
      };

      //Style for months
      const taskMonthInfo = this.getMonthWeekInfo(task.date);
      const topPixelsMonth = (taskMonthInfo.weekIndex * 100) + (monitorIndex * taskMonthInfo.totalWeeks * 100);

      const styleMonth = {
        'left': styleWeek.left,
        'width': styleWeek.width,
        'top': `${topPixelsMonth}px`
      };

      //Background color of block tasks
      if (task.type === 'block_personal' || task.type === 'block_payed' || task.type === 'block_no_payed') {
        style['background-color'] = task.color;
        styleWeek['background-color'] = task.color;
        styleMonth['background-color'] = task.color;
      }

      return {
        ...task,
        style,
        styleWeek,
        styleMonth,
        class: `task-${task.type}`
      };
    });

    // Separating tasks with monitor_id = null and grouping by date
    const noMonitorTasks = plannerTasks.filter(task => task.monitor_id === null);
    const groupedByDate = noMonitorTasks.reduce((group, task) => {
      (group[task.date] = group[task.date] || []).push(task);
      return group;
    }, {});

    //Store ids that will be deleted
    let groupedTaskIds = new Set();

    // Process each group to adjust overlapping tasks
    Object.keys(groupedByDate).forEach(date => {
      const tasksForDate = groupedByDate[date];

      // Group tasks by course_id, hour_start, and hour_end if course_id is not null
      const groupedByCourseTime = tasksForDate.reduce((group, task) => {
        if (task.course_id != null) {
          const key = `${task.course_id}-${task.hour_start}-${task.hour_end}`;
          if (!group[key]) {
            group[key] = {
              ...task, // Take the first task's details
              grouped_tasks: [] // Initialize the array for grouped tasks
            };
          }
          group[key].grouped_tasks.push(task);
          groupedTaskIds.add(task.booking_id);
        } else {
          // If course_id is null, keep the task as an individual task
          (group["__singleTasks__"] = group["__singleTasks__"] || []).push(task);
        }
        return group;
      }, {});

      // Flatten the grouped tasks into an array
      const flattenedTasks = [].concat(...Object.values(groupedByCourseTime));

      // Sort flattened tasks by start time
      flattenedTasks.sort((a, b) => {
        const timeA = this.parseTime(a.hour_start).getTime();
        const timeB = this.parseTime(b.hour_start).getTime();
        return timeA - timeB;
      });

      // Initialize an array to store the overlapping task groups
      let overlappingGroups = [];

      flattenedTasks.forEach(task => {
        let placed = false;
        for (let group of overlappingGroups) {
          // Check if the task overlaps with the group
          if (group.some(t => !(this.parseTime(t.hour_end) <= this.parseTime(task.hour_start) || this.parseTime(t.hour_start) >= this.parseTime(task.hour_end)))) {
            // If it overlaps, add to the group and set placed to true
            group.push(task);
            placed = true;
            break;
          }
        }

        // If the task did not fit in any group, create a new group
        if (!placed) overlappingGroups.push([task]);
      });

      // Assign heights and tops based on the groups
      overlappingGroups.forEach((group, index) => {
        const height = 100 / group.length;
        group.forEach((task, idx) => {
          task.style = {
            ...task.style,
            'height': `${height}px`,
            'top': `${height * idx}px`
          };
          task.styleWeek = {
            ...task.styleWeek,
            'height': `${height}px`,
            'top': `${height * idx}px`
          };
          task.styleMonth = {
            ...task.styleMonth,
            'height': `${height}px`,
            'top': `${parseInt(task.styleMonth.top, 10) + (height * idx)}px`
          };
        });
      });

      // Replace the tasks for the date with the processed tasks
      groupedByDate[date] = overlappingGroups.flat();
    });

    // Remove the original tasks that were grouped -> NOT THE ONES THAT ALREADY HAVE MONITOR
    const filteredPlannerTasks = plannerTasks.filter(task =>
      !groupedTaskIds.has(task.booking_id) ||
      (groupedTaskIds.has(task.booking_id) && task.monitor_id)
    );

    // Combine adjusted tasks with the rest
    this.plannerTasks = [...filteredPlannerTasks, ...Object.values(groupedByDate).flat()];

  }

  getMonthWeekInfo(dateString:any) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    //Week index
    const startDay = firstDayOfMonth.getDay() || 7;
    //Subtract 1 so that it starts on 0
    let weekIndex = Math.ceil((date.getDate() + startDay - 1) / 7) - 1;

    //Total weeks
    const lastDayWeekDay = lastDayOfMonth.getDay() || 7;
    const daysInLastWeek = 7 - lastDayWeekDay;
    const totalWeeks = Math.ceil((lastDayOfMonth.getDate() + daysInLastWeek) / 7);

    return {
      weekIndex,
      totalWeeks
    };
  }


  parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  }

  formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }


  // LOGIC

  toggleDetail(task:any){
    //console.log(task);
    if(task.booking_id){
      if(task.grouped_tasks && task.grouped_tasks.length > 1){
        //Open Modal grouped courses
        this.groupedTasks = task.grouped_tasks;
        this.idGroupedTasks = task.booking_id;
        this.hourGrouped = task.hour_start;
        this.dateGrouped = task.date;
        this.showGrouped = true;
      }
      else{
        //Load course
        this.idDetail = task.booking_id;
        this.hourDetail = task.hour_start;
        this.dateDetail = task.date;
        this.monitorDetail = task.monitor_id;
        this.subgroupDetail = task.course_subgroup_id;
        this.taskDetail = task;
        this.showDetail = true;
      }
      this.hideBlock();
      this.hideEditBlock();
    }
  }

  toggleBlock(block:any){
    this.idBlock = block.block_id;
    this.blockDetail = block;
    this.hideDetail();
    this.hideEditBlock();
    this.showBlock = true;
  }

  hideDetail() {
    this.idDetail = null;
    this.hourDetail = null;
    this.dateDetail = null;
    this.monitorDetail = null;
    this.subgroupDetail = null;
    this.taskDetail = null;
    this.showDetail = false;
    this.editedMonitor = null;
    this.showEditMonitor = false;
  }

  hideBlock() {
    this.idBlock = null;
    this.blockDetail = null;
    this.showBlock = false;
  }

  hideGrouped() {
    this.groupedTasks = [];
    this.idGroupedTasks = null;
    this.hourGrouped = null;
    this.dateGrouped = null;
    this.showGrouped = false;
  }

  toggleDetailMove(task: any, event: any) {
    event.preventDefault();
    if (task.booking_id) {
      const dialogRef = this.dialog.open(ConfirmModalComponent, {
        maxWidth: '100vw',
        panelClass: 'full-screen-dialog',
        data: { message: "Are you sure you want to move this task?", title: "Confirm Move" }
      });

      dialogRef.afterClosed().subscribe((userConfirmed: boolean) => {
        if (userConfirmed) {
          this.moveTask = true;
          this.taskMoved = task;
        } else {
        }
      });
    }
  }

  moveMonitor(monitor_id:any,event: MouseEvent): void {
    if (this.moveTask) {
      event.stopPropagation();

      if(this.taskMoved && this.taskMoved.monitor_id != monitor_id){
        let data:any;
        let all_booking_users = [];
        this.taskMoved.all_clients.forEach((client:any) => {
          all_booking_users.push(client.id);
        });
        data = {
          monitor_id: monitor_id,
          booking_users: all_booking_users
        };

        //console.log(data);

        this.crudService.post('/admin/planner/monitors/transfer', data)
          .subscribe((data) => {

            //this.getData();
            this.moveTask = false;
            this.taskMoved = null;
            this.hideDetail();
            this.loadBookings(this.currentDate);
            this.snackbar.open(this.translateService.instant('snackbar.monitor.update'), 'OK', {duration: 3000});
          },
          (error) => {
            // Error handling code
            this.moveTask = false;
            this.taskMoved = null;
            console.error('Error occurred:', error);
            if(error.error && error.error.message && error.error.message == "Overlap detected. Monitor cannot be transferred."){
              this.snackbar.open(this.translateService.instant('monitor_busy'), 'OK', {duration: 3000});
            }
            else{
              this.snackbar.open(this.translateService.instant('event_overlap'), 'OK', {duration: 3000});
            }
          })

      }
      else{
        this.moveTask = false;
        this.taskMoved = null;
      }
    }
  }

  getDateFormatLong(date:string) {
    return moment(date).format('dddd, D MMMM YYYY');
  }

  getHourRangeFormat(hour_start:string,hour_end:string) {
    return hour_start.substring(0, 5)+' - '+hour_end.substring(0, 5);
  }

  getHoursMinutes(hour_start:string, hour_end:string) {
    const parseTime = (time:string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return { hours, minutes };
    };

    const startTime = parseTime(hour_start);
    const endTime = parseTime(hour_end);

    let durationHours = endTime.hours - startTime.hours;
    let durationMinutes = endTime.minutes - startTime.minutes;

    if (durationMinutes < 0) {
      durationHours--;
      durationMinutes += 60;
    }

    return `${durationHours}h${durationMinutes}m`;
  }

  getBirthYears(date:string) {
    const birthDate = moment(date);
    return moment().diff(birthDate, 'years');
  }

  getLanguageById(languageId: number): string {
    const language = this.languages.find(c => c.id === languageId);
    return language ? language.code.toUpperCase() : '';
  }

  getCountryById(countryId: number): string {
    const country = MOCK_COUNTRIES.find(c => c.id === countryId);
    return country ? country.code : 'Aucun';
  }

  getClientDegree(sport_id:any,sports:any) {
    const sportObject = sports.find(sport => sport.id === sport_id);
    if (sportObject && sportObject.pivot && sportObject.pivot.degree_id) {
      return sportObject.pivot.degree_id;
    }
    else{
      return 0;
    }
  }

  openEditMonitor() {
    this.editedMonitor = null;
    this.showEditMonitor = true;
    this.checkAvailableMonitors();
  }

  hideEditMonitor() {
    this.editedMonitor = null;
    this.showEditMonitor = false;
  }

  saveEditedMonitor() {
    let data:any;
    let all_booking_users = [];
    this.taskDetail.all_clients.forEach((client:any) => {
      all_booking_users.push(client.id);
    });
    /*
    if(this.taskDetail.type == 'collective'){
      data = {
        type: 1,
        monitor_id: this.editedMonitor.id,
        subgroup_id: this.taskDetail.course_subgroup_id,
        booking_users: all_booking_users
      };
    }
    else if(this.taskDetail.type == 'private'){
      data = {
        type: 2,
        monitor_id: this.editedMonitor.id,
        course_id: this.taskDetail.course_id,
        booking_users: all_booking_users
      };
    }*/
    data = {
      monitor_id: this.editedMonitor.id,
      booking_users: all_booking_users
    };

    //console.log(data);

    this.crudService.post('/admin/planner/monitors/transfer', data)
    .subscribe((data) => {

      //this.getData();
      this.editedMonitor = null;
      this.showEditMonitor = false;
      this.hideDetail();
      this.loadBookings(this.currentDate);
      this.snackbar.open(this.translateService.instant('snackbar.monitor.update'), 'OK', {duration: 3000});
    },
    (error) => {
      // Error handling code
      console.error('Error occurred:', error);
      if(error.error && error.error.message && error.error.message == "Overlap detected. Monitor cannot be transferred."){
        this.snackbar.open(this.translateService.instant('monitor_busy'), 'OK', {duration: 3000});
      }
      else{
        this.snackbar.open(this.translateService.instant('error'), 'OK', {duration: 3000});
      }
    })

  }

  goToEditCourse() {
    const dialogRef = this.dialog.open(CourseDetailModalComponent, {
      width: '100%',
      height: '1200px',
      maxWidth: '90vw',
      panelClass: 'full-screen-dialog',
      data: {
        id: this.taskDetail.course.id
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

      }
    });
  }

  handleDbClickEvent(action: string, event: any, type:string, position:any, monitor_id:any, hourDay?:any, positionWeek?:any): void {

    /* GET DATE,HOUR,MONITOR -> DOUBLE CLICK */

    let dateInfo;
    let currentDate = moment(this.currentDate);

    switch (type) {
      case 'day':
          dateInfo = {
            date: this.currentDate,
            date_format: moment(this.currentDate).format('DD-MM-YYYY'),
            hour: position,
            monitor_id: monitor_id
          };
          break;
      case 'week':
          let mondayOfWeek = currentDate.clone().startOf('isoWeek');
          let weekDayDate = mondayOfWeek.add(position, 'days');
          dateInfo = {
            date: moment(weekDayDate).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (zz)'),
            date_format: moment(weekDayDate).format('DD-MM-YYYY'),
            hour: hourDay,
            monitor_id: monitor_id
          };
          break;
      case 'month':
          let firstDayOfMonth = currentDate.clone().startOf('month');
          let startOfWeek = firstDayOfMonth.add(positionWeek, 'weeks');
          startOfWeek.startOf('isoWeek');
          let monthDayDate = startOfWeek.add(position, 'days');
          dateInfo = {
            date: moment(monthDayDate).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (zz)'),
            date_format: moment(monthDayDate).format('DD-MM-YYYY'),
            hour: hourDay,
            monitor_id: monitor_id
          };
          break;
      default:
          throw new Error('Invalid type');
    }


    /* END DATA DOUBLE CLICK */

    const dialogRef = this.dialog.open(CalendarEditComponent, {
      data: {
        event,
        monitor_id: dateInfo.monitor_id,
        date_param: dateInfo.date_format,
        hour_start: dateInfo.hour
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);

        const data = {
          user_nwd_subtype_id: result.user_nwd_subtype_id, color: result.color, monitor_id: dateInfo.monitor_id, start_date: result.start_date, end_date: result.end_date, start_time: result.full_day ? null : `${result.start_time}:00`, end_time: result.full_day ? null : `${result.end_time}:00`, full_day: result.full_day, station_id: result.station_id, school_id: result.school_id, description: result.description
        }
        this.crudService.create('/monitor-nwds', data)
          .subscribe((data) => {

            //this.getData();
            this.loadBookings(this.currentDate);
            this.snackbar.open(this.translateService.instant('event_created'), 'OK', {duration: 3000});
          },
          (error) => {
            // Error handling code
            console.error('Error occurred:', error);
            if(error.error && error.error.message && error.error.message == "El monitor está ocupado durante ese tiempo y no se puede crear el MonitorNwd"){
              this.snackbar.open(this.translateService.instant('monitor_busy'), 'OK', {duration: 3000});
            }
            else{
              this.snackbar.open(this.translateService.instant('error'), 'OK', {duration: 3000});
            }
          })
          //CHANGE
        /*let id = 1
        result.monitor_id = id;

        const isOverlap = this.eventService.isOverlap(this.events, result);
        if (isOverlap.length === 0) {
          if (result.user_nwd_subtype_id !== 0) {

            this.crudService.create('/monitor-nwds', result)
            .subscribe((data) => {

              this.getData();
              this.snackbar.open('Event created');
            })
          }
        } else {

          const updateEdit = this.events[isOverlap[0].overlapedId].id;
          this.crudService.update('/monitor-nwds', isOverlap[0].dates[0], updateEdit)
            .subscribe((data) => {
              isOverlap[0].dates[1].start_time = data.data.end_time;
              this.crudService.create('/monitor-nwds', isOverlap[0].dates[1])
              .subscribe((data) => {

                this.getData();
                this.snackbar.open('Event created');
              })
            })
          // hacer el update y el create
          this.snackbar.open('Existe un solapamiento', 'OK', {duration: 3000});
        }*/

      }
    });
  }

  /* FILTER */
  onCheckChange(sportId: number, isChecked: boolean) {
    if (isChecked) {
      this.checkedSports.add(sportId);
    } else {
      this.checkedSports.delete(sportId);
    }
  }

  areAllChecked() {
    return this.checkedSports.size === this.sports.length;
  }

  showResetFilters() {
    return !(this.areAllChecked() && this.filterMonitor == null &&
             this.filterFree && this.filterOccupied &&
             this.filterCollective && this.filterPrivate && this.filterNwd &&
             this.filterBlockPayed && this.filterBlockNotPayed);
  }

  applyFilters() {
    this.showFilter=false;
    this.loadBookings(this.currentDate);
  }

  resetFilters() {
    this.checkedSports.clear();
    this.sports.forEach(sport => this.checkedSports.add(sport.id));
    this.filterMonitor=null;
    this.filterFree=true;
    this.filterOccupied=true;
    this.filterCollective=true;
    this.filterPrivate=true;
    this.filterNwd=true;
    this.filterBlockPayed=true;
    this.filterBlockNotPayed=true;

    this.applyFilters();
  }

  /* Edit blocks */

  openEditBlock() {
    this.allHoursDay = this.blockDetail.full_day;
    this.startTimeDay = this.blockDetail.hour_start;
    this.endTimeDay = this.blockDetail.hour_end;
    this.nameBlockDay = this.blockDetail.name;
    this.divideDay = false;
    this.startTimeDivision = '';
    this.endTimeDivision = '';
    this.showEditBlock = true;
  }

  hideEditBlock() {
    this.showEditBlock = false;
  }

  onStartTimeDayChange() {
    const filteredEndHours = this.filteredEndHoursDay;

    if (!filteredEndHours.includes(this.endTimeDay)) {
      this.endTimeDay = filteredEndHours[0] || '';
    }
  }

  get filteredEndHoursDay() {
    const startIndex = this.hoursRangeMinutes.indexOf(this.startTimeDay);
    return this.hoursRangeMinutes.slice(startIndex + 1);
  }

  onStartTimeDivisionChange() {
    const filteredEndHours = this.filteredEndHoursDivision;
    if (!filteredEndHours.includes(this.endTimeDivision)) {
      this.endTimeDivision = filteredEndHours[0] || '';
    }
  }

  get filteredStartHoursDivision() {
    const startIndex = this.allHoursDay ? this.hoursRangeMinutes.indexOf(this.hoursRangeMinutes[0]) : this.hoursRangeMinutes.indexOf(this.startTimeDay);
    const endIndex = this.allHoursDay ? this.hoursRangeMinutes.indexOf( this.hoursRangeMinutes[this.hoursRangeMinutes.length - 1] ) : this.hoursRangeMinutes.indexOf(this.endTimeDay);
    return this.hoursRangeMinutes.slice(startIndex + 1, endIndex - 1);
  }

  get filteredEndHoursDivision() {
    const defaultStartIndex = this.calculateDefaultStartTimeDivisionIndex();
    const startIndex = this.startTimeDivision ? this.hoursRangeMinutes.indexOf(this.startTimeDivision) : defaultStartIndex;
    const endIndex = this.allHoursDay ? this.hoursRangeMinutes.indexOf( this.hoursRangeMinutes[this.hoursRangeMinutes.length - 1] ) : this.hoursRangeMinutes.indexOf(this.endTimeDay);
    return this.hoursRangeMinutes.slice(startIndex + 1, endIndex);
  }

  calculateDefaultStartTimeDivisionIndex() {
    const blockStartTimeIndex = this.allHoursDay ? this.hoursRangeMinutes.indexOf(this.hoursRangeMinutes[0]) : this.hoursRangeMinutes.indexOf(this.startTimeDay);
    return blockStartTimeIndex + 1;
  }

  isButtonDayEnabled() {
    if (this.divideDay) {
      return this.nameBlockDay && this.startTimeDivision && this.endTimeDivision && (this.allHoursDay || (this.startTimeDay && this.endTimeDay));
    } else {
      return this.nameBlockDay && (this.allHoursDay || (this.startTimeDay && this.endTimeDay));
    }
  }

  saveEditedBlock() {
      const commonData = {
        monitor_id: this.blockDetail.monitor_id,
        school_id: this.blockDetail.school_id,
        station_id: this.blockDetail.station_id,
        description: this.nameBlockDay,
        color: this.blockDetail.color_block,
        user_nwd_subtype_id: this.blockDetail.user_nwd_subtype_id,
      };
      let firstBlockData:any = { ...commonData, start_date: this.blockDetail.start_date, end_date: this.blockDetail.end_date };
      let secondBlockData:any;

      // Calculate time moments
      firstBlockData.start_time = this.allHoursDay ? `${this.hoursRangeMinutes[0]}:00` : `${this.startTimeDay}:00`;
      firstBlockData.end_time = this.divideDay ? `${this.startTimeDivision}:00` : (this.allHoursDay ? `${this.hoursRangeMinutes[this.hoursRangeMinutes.length - 1]}:00` : `${this.endTimeDay}:00`);
      firstBlockData.full_day = this.allHoursDay && !this.divideDay;


      // Function update first block -> CALL LATER
      const updateFirstBlock = () => {
        this.crudService.update('/monitor-nwds', firstBlockData, this.blockDetail.block_id).subscribe(
            response => {
                if (this.divideDay) {
                    createSecondBlock();
                } else {
                    finalizeUpdate();
                }
            },
            error => {
                handleErrorUpdatingBlock(error);
            }
        );
      };

      const createSecondBlock = () => {
          secondBlockData = { ...commonData, start_date: this.blockDetail.start_date, end_date: this.blockDetail.end_date, start_time: `${this.endTimeDivision}:00`, end_time: `${this.endTimeDay}:00`, full_day: false };
          this.crudService.post('/monitor-nwds', secondBlockData).subscribe(
              secondResponse => {
                  finalizeUpdate();
              },
              error => {
                  handleErrorCreatingBlock(error);
              }
          );
      };

      const finalizeUpdate = () => {
          this.hideEditBlock();
          this.hideBlock();
          this.loadBookings(this.currentDate);
          this.snackbar.open(this.translateService.instant('event_edited'), 'OK', {duration: 3000});
      };

      const handleErrorUpdatingBlock = (error:any) => {
          console.error('Error occurred:', error);
          if(error.error && error.error.message && error.error.message == "El monitor está ocupado durante ese tiempo y no se puede actualizar el MonitorNwd"){
            this.snackbar.open(this.translateService.instant('monitor_busy'), 'OK', {duration: 3000});
          }
          else{
            this.snackbar.open(this.translateService.instant('error'), 'OK', {duration: 3000});
          }
      };

      const handleErrorCreatingBlock = (error:any) => {
          console.error('Error occurred:', error);
          if(error.error && error.error.message && error.error.message == "El monitor está ocupado durante ese tiempo y no se puede actualizar el MonitorNwd"){
            this.snackbar.open(this.translateService.instant('monitor_busy'), 'OK', {duration: 3000});
          }
          else{
            this.snackbar.open(this.translateService.instant('error'), 'OK', {duration: 3000});
          }
      };

      // Start Update Process
      updateFirstBlock();
  }

  deleteEditedBlock() {
        const isConfirmed = confirm('Êtes-vous sûr de vouloir supprimer le blocage?');
        if (isConfirmed) {
            this.crudService.delete('/monitor-nwds', this.blockDetail.block_id).subscribe(
                response => {
                    this.hideEditBlock();
                    this.hideBlock();
                    this.loadBookings(this.currentDate);
                },
                error => {
                }
            );
        }
  }

  getDayOfWeek(dayIndex: number): number {
    const startOfWeek = moment(this.currentDate).startOf('isoWeek');
    const specificDate = startOfWeek.add(dayIndex, 'days');
    return specificDate.date();
  }

  /*
  getDayOfMonth(weekIndex: number, dayIndex: number): string {
    const startOfWeek = moment(startOfMonth(this.currentDate)).add(weekIndex, 'weeks');
    const specificDate = startOfWeek.startOf('isoWeek').add(dayIndex, 'days');
    if (specificDate.month() === this.currentDate.getMonth()) {
        return specificDate.format('D');
    }
    return '';
  }
  */

  checkAvailableMonitors() {

    this.loadingMonitors = true;
    const data = {
      sportId: this.taskDetail.sport_id,
      minimumDegreeId: this.taskDetail.degree_id || this.taskDetail.degree.id,
      startTime: this.taskDetail.hour_start,
      endTime: this.taskDetail.hour_end,
      date: this.taskDetail.date
    };

    this.crudService.post('/admin/monitors/available', data)
      .subscribe((response) => {
        this.monitorsForm = response.data;
        this.loadingMonitors = false;
      })
  }

  detailBooking() {
    const dialogRef = this.dialog.open(BookingDetailModalComponent, {
      width: '100%',
      height: '1200px',
      maxWidth: '90vw',
      panelClass: 'full-screen-dialog',
      data: {
        id: this.taskDetail.booking_id,
      }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.snackbar.open(this.translateService.instant('snackbar.booking.create'), 'OK', {duration: 3000});
      }
    });
  }

  openUserTransfer() {
    const dialogRef = this.dialog.open(CourseUserTransferTimelineComponent, {
      width: '800px',
      height: '800px',
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales
      data: {degree: this.taskDetail.degree, subgroup: this.taskDetail.course_subgroup_id, id: this.taskDetail.course_id,
        subgroupNumber: this.taskDetail.subgroup_number, currentDate: moment(this.taskDetail.date), degrees: this.taskDetail.degrees_sport, currentStudents: this.taskDetail.all_clients}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        dialogRef.close();
      }
    });
  }
}
