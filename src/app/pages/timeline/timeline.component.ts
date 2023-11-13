import { Component } from '@angular/core';
import { addDays, getDay, startOfWeek, endOfWeek, addWeeks, subWeeks, format, isSameMonth, startOfMonth, endOfMonth, addMonths, subMonths, max, min } from 'date-fns';

@Component({
  selector: 'vex-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent {

  hoursRange: string[] = this.generateHoursRange('08:00', '18:00');

  monitors = [
    { id: 1, name: 'David Wilson' },
    { id: 2, name: 'John Smith' },
    { id: 3, name: 'Michael Brown' },
    { id: 4, name: 'Sarah Johnson' },
  ];
  tasksCalendar: any[] = [
    {date:'2023-11-13',hour_start:'09:30',hour_end:'11:00',type:'collective',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-13',hour_start:'11:30',hour_end:'13:30',type:'private',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-16',hour_start:'09:30',hour_end:'11:00',type:'collective',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-16',hour_start:'11:30',hour_end:'13:30',type:'private',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-19',hour_start:'09:30',hour_end:'11:00',type:'collective',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-19',hour_start:'11:30',hour_end:'13:30',type:'private',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-22',hour_start:'09:30',hour_end:'11:00',type:'collective',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-22',hour_start:'11:30',hour_end:'13:30',type:'private',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-27',hour_start:'09:30',hour_end:'11:00',type:'collective',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-27',hour_start:'11:30',hour_end:'13:30',type:'private',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-03',hour_start:'09:30',hour_end:'11:00',type:'collective',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-03',hour_start:'11:30',hour_end:'13:30',type:'private',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-07',hour_start:'09:30',hour_end:'11:00',type:'collective',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-07',hour_start:'11:30',hour_end:'13:30',type:'private',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-12',hour_start:'09:30',hour_end:'11:00',type:'collective',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-12',hour_start:'11:30',hour_end:'13:30',type:'private',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-18',hour_start:'09:30',hour_end:'11:00',type:'collective',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-18',hour_start:'11:30',hour_end:'13:30',type:'private',monitor:1,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},

    {date:'2023-11-14',hour_start:'08:00',hour_end:'09:00',type:'block',monitor:2,title:'Blocage personnelle'},
    {date:'2023-11-14',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:2,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-14',hour_start:'12:00',hour_end:'13:00',type:'other',monitor:2,title:'Événement ou activité'},
    {date:'2023-11-19',hour_start:'08:00',hour_end:'09:00',type:'block',monitor:2,title:'Blocage personnelle'},
    {date:'2023-11-19',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:2,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-19',hour_start:'12:00',hour_end:'13:00',type:'other',monitor:2,title:'Événement ou activité'},
    {date:'2023-11-23',hour_start:'08:00',hour_end:'09:00',type:'block',monitor:2,title:'Blocage personnelle'},
    {date:'2023-11-23',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:2,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-23',hour_start:'12:00',hour_end:'13:00',type:'other',monitor:2,title:'Événement ou activité'},
    {date:'2023-11-29',hour_start:'08:00',hour_end:'09:00',type:'block',monitor:2,title:'Blocage personnelle'},
    {date:'2023-11-29',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:2,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-29',hour_start:'12:00',hour_end:'13:00',type:'other',monitor:2,title:'Événement ou activité'},
    {date:'2023-12-04',hour_start:'08:00',hour_end:'09:00',type:'block',monitor:2,title:'Blocage personnelle'},
    {date:'2023-12-04',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:2,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-04',hour_start:'12:00',hour_end:'13:00',type:'other',monitor:2,title:'Événement ou activité'},
    {date:'2023-12-10',hour_start:'08:00',hour_end:'09:00',type:'block',monitor:2,title:'Blocage personnelle'},
    {date:'2023-12-10',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:2,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-10',hour_start:'12:00',hour_end:'13:00',type:'other',monitor:2,title:'Événement ou activité'},
    {date:'2023-12-14',hour_start:'08:00',hour_end:'09:00',type:'block',monitor:2,title:'Blocage personnelle'},
    {date:'2023-12-14',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:2,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-14',hour_start:'12:00',hour_end:'13:00',type:'other',monitor:2,title:'Événement ou activité'},
    {date:'2023-12-19',hour_start:'08:00',hour_end:'09:00',type:'block',monitor:2,title:'Blocage personnelle'},
    {date:'2023-12-19',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:2,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-19',hour_start:'12:00',hour_end:'13:00',type:'other',monitor:2,title:'Événement ou activité'},

    {date:'2023-11-13',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-13',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-13',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},
    {date:'2023-11-18',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-18',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-18',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},
    {date:'2023-11-22',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-22',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-22',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},
    {date:'2023-11-28',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-28',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-28',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},
    {date:'2023-12-02',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-02',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-02',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},
    {date:'2023-12-06',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-06',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-06',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},
    {date:'2023-12-10',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-10',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-10',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},
    {date:'2023-12-18',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-18',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-18',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},
    {date:'2023-12-23',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-23',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-23',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},
    {date:'2023-12-26',hour_start:'11:00',hour_end:'12:00',type:'private',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-26',hour_start:'09:00',hour_end:'11:00',type:'collective',monitor:3,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-26',hour_start:'13:00',hour_end:'16:00',type:'block',monitor:3,title:'Blocage personnelle'},

    {date:'2023-11-14',hour_start:'08:00',hour_end:'10:00',type:'block',monitor:4,title:'Blocage personnelle'},
    {date:'2023-11-14',hour_start:'10:00',hour_end:'11:00',type:'private',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-14',hour_start:'11:00',hour_end:'13:00',type:'block-payed',monitor:4,title:'Blocage payant'},
    {date:'2023-11-14',hour_start:'13:00',hour_end:'14:00',type:'collective',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-14',hour_start:'14:00',hour_end:'15:00',type:'other',monitor:4,title:'Événement ou activité'},
    {date:'2023-11-19',hour_start:'08:00',hour_end:'10:00',type:'block',monitor:4,title:'Blocage personnelle'},
    {date:'2023-11-19',hour_start:'10:00',hour_end:'11:00',type:'private',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-19',hour_start:'11:00',hour_end:'13:00',type:'block-payed',monitor:4,title:'Blocage payant'},
    {date:'2023-11-19',hour_start:'13:00',hour_end:'14:00',type:'collective',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-19',hour_start:'14:00',hour_end:'15:00',type:'other',monitor:4,title:'Événement ou activité'},
    {date:'2023-11-24',hour_start:'08:00',hour_end:'10:00',type:'block',monitor:4,title:'Blocage personnelle'},
    {date:'2023-11-24',hour_start:'10:00',hour_end:'11:00',type:'private',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-24',hour_start:'11:00',hour_end:'13:00',type:'block-payed',monitor:4,title:'Blocage payant'},
    {date:'2023-11-24',hour_start:'13:00',hour_end:'14:00',type:'collective',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-24',hour_start:'14:00',hour_end:'15:00',type:'other',monitor:4,title:'Événement ou activité'},
    {date:'2023-11-29',hour_start:'08:00',hour_end:'10:00',type:'block',monitor:4,title:'Blocage personnelle'},
    {date:'2023-11-29',hour_start:'10:00',hour_end:'11:00',type:'private',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-29',hour_start:'11:00',hour_end:'13:00',type:'block-payed',monitor:4,title:'Blocage payant'},
    {date:'2023-11-29',hour_start:'13:00',hour_end:'14:00',type:'collective',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-11-29',hour_start:'14:00',hour_end:'15:00',type:'other',monitor:4,title:'Événement ou activité'},
    {date:'2023-12-02',hour_start:'08:00',hour_end:'10:00',type:'block',monitor:4,title:'Blocage personnelle'},
    {date:'2023-12-02',hour_start:'10:00',hour_end:'11:00',type:'private',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-02',hour_start:'11:00',hour_end:'13:00',type:'block-payed',monitor:4,title:'Blocage payant'},
    {date:'2023-12-02',hour_start:'13:00',hour_end:'14:00',type:'collective',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-02',hour_start:'14:00',hour_end:'15:00',type:'other',monitor:4,title:'Événement ou activité'},
    {date:'2023-12-09',hour_start:'08:00',hour_end:'10:00',type:'block',monitor:4,title:'Blocage personnelle'},
    {date:'2023-12-09',hour_start:'10:00',hour_end:'11:00',type:'private',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-09',hour_start:'11:00',hour_end:'13:00',type:'block-payed',monitor:4,title:'Blocage payant'},
    {date:'2023-12-09',hour_start:'13:00',hour_end:'14:00',type:'collective',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-09',hour_start:'14:00',hour_end:'15:00',type:'other',monitor:4,title:'Événement ou activité'},
    {date:'2023-12-14',hour_start:'08:00',hour_end:'10:00',type:'block',monitor:4,title:'Blocage personnelle'},
    {date:'2023-12-14',hour_start:'10:00',hour_end:'11:00',type:'private',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-14',hour_start:'11:00',hour_end:'13:00',type:'block-payed',monitor:4,title:'Blocage payant'},
    {date:'2023-12-14',hour_start:'13:00',hour_end:'14:00',type:'collective',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-14',hour_start:'14:00',hour_end:'15:00',type:'other',monitor:4,title:'Événement ou activité'},
    {date:'2023-12-19',hour_start:'08:00',hour_end:'10:00',type:'block',monitor:4,title:'Blocage personnelle'},
    {date:'2023-12-19',hour_start:'10:00',hour_end:'11:00',type:'private',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-19',hour_start:'11:00',hour_end:'13:00',type:'block-payed',monitor:4,title:'Blocage payant'},
    {date:'2023-12-19',hour_start:'13:00',hour_end:'14:00',type:'collective',monitor:4,title:'Classes de ski / Dimanches Lève-tôt / dès 5 ans'},
    {date:'2023-12-19',hour_start:'14:00',hour_end:'15:00',type:'other',monitor:4,title:'Événement ou activité'},
  ];

  tasksCalendarStyle: any[];
  filteredTasks: any[];
  currentDate = new Date();
  timelineView: string = 'day';
  currentWeek: string = '';
  weekDays: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  currentMonth: string = '';
  weeksInMonth: any[] = [];

  constructor() {}

  async ngOnInit() {
    this.calculateWeeksInMonth();
    await this.calculateTaskPositions();
    this.filterTasksForDate(this.currentDate);
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
    this.filterTasksForDate(this.currentDate);
  }

  filterTasksForDate(date: Date) {
    if (this.timelineView === 'week') {
      const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 });
      const endOfWeekDate = endOfWeek(date, { weekStartsOn: 1 });

      this.filteredTasks = this.tasksCalendarStyle.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= startOfWeekDate && taskDate <= endOfWeekDate;
      });
    } else if (this.timelineView === 'month') {
      const startMonth = startOfMonth(date);
      const endMonth = endOfMonth(date);

      this.filteredTasks = this.tasksCalendarStyle.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= startMonth && taskDate <= endMonth;
      });
    } else {
      const dateStr = date.toISOString().split('T')[0];
      this.filteredTasks = this.tasksCalendarStyle.filter(task => task.date === dateStr);
    }
  }

  calculateWeeksInMonth() {
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
    return isSameMonth(specificDate, this.currentDate);
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

 async calculateTaskPositions() {
    const pixelsPerMinute = 220 / 60;
    const pixelsPerMinuteWeek = 400 / ((this.hoursRange.length - 1) * 60);
    this.tasksCalendarStyle = this.tasksCalendar.map(task => {
      //Style for days
      const startTime = this.parseTime(task.hour_start);
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const rangeStart = this.parseTime(this.hoursRange[0]);
      const rangeStartMinutes = rangeStart.getHours() * 60 + rangeStart.getMinutes();
      const leftMinutes = startMinutes - rangeStartMinutes;
      const leftPixels = leftMinutes * pixelsPerMinute;

      const endTime = this.parseTime(task.hour_end);
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
      const durationMinutes = endMinutes - startMinutes;
      const widthPixels = durationMinutes * pixelsPerMinute;

      const monitorIndex = this.monitors.findIndex(m => m.id === task.monitor);
      const topPixels = monitorIndex * 100;

      const style = {
        'left': `${leftPixels}px`,
        'width': `${widthPixels}px`,
        'top': `${topPixels}px`
      };

      //Style for weeks
      const taskDate = new Date(task.date);
      const dayOfWeek = taskDate.getDay();
      const initialLeftOffset = (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 400;

      const startTimeWeek = this.parseTime(task.hour_start);
      const rangeStartWeek = this.parseTime(this.hoursRange[0]);
      const startMinutesWeek = startTimeWeek.getHours() * 60 + startTimeWeek.getMinutes();
      const rangeStartMinutesWeek = rangeStartWeek.getHours() * 60 + rangeStartWeek.getMinutes();
      const leftMinutesWeek = startMinutesWeek - rangeStartMinutesWeek;
      const additionalLeftPixels = leftMinutesWeek * pixelsPerMinuteWeek;

      const endTimeWeek = this.parseTime(task.hour_end);
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

      return {
        ...task,
        style,
        styleWeek,
        styleMonth,
        class: `task-${task.type}`
      };
    });
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

}
