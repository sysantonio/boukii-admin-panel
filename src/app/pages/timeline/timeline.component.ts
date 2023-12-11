import { Component } from '@angular/core';
import { addDays, getDay, startOfWeek, endOfWeek, addWeeks, subWeeks, format, isSameMonth, startOfMonth, endOfMonth, addMonths, subMonths, max, min } from 'date-fns';
import { ApiCrudService } from 'src/service/crud.service';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import * as moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

@Component({
  selector: 'vex-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent {

  hoursRange: string[] = this.generateHoursRange('08:00', '20:00');

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

  allMonitors:any[] =[];
  plannerTasks:any[] =[];
  vacationDays:any[];

  user:any=null;
  activeSchool:any=null;
  languages:any[] = [];
  sports:any[] = [];
  degrees:any[] = [];
  showGrouped:boolean=false;
  groupedTasks:any[] = [];
  idGroupedTasks:any;
  showDetail:boolean=false;
  idDetail:any;
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

  constructor(private crudService: ApiCrudService,) {
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
    await this.getDegrees();
    let vacationDaysString = "[\"2023-12-08\",\"2024-01-06\",\"2024-01-17\",\"2024-02-01\",\"2024-02-02\"]";
    this.vacationDays = JSON.parse(vacationDaysString);
    await this.calculateWeeksInMonth();
    //await this.calculateTaskPositions();
    this.loadBookings(this.currentDate);
  }

  async getUser() {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    const activeSchool = this.user.schools.find(school => school.active === true);
    if (activeSchool) {
        return activeSchool.id;
    } else {
        console.log("No active school found.");
        return null;
    }
  }

  async getLanguages() {
    try {
      const data: any = await this.crudService.get('/languages?&perPage='+99999).toPromise();
      console.log(data);
      this.languages = data.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  async getSports(){
    try {
      const data: any = await this.crudService.get('/sports?perPage='+99999).toPromise();
      console.log(data);
      this.sports = data.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  async getDegrees(){
    try {
      const data: any = await this.crudService.get('/degrees?school_id='+this.activeSchool+'&perPage='+99999).toPromise();
      console.log(data);
      this.degrees = data.data.sort((a, b) => a.degree_order - b.degree_order);
      this.degrees.forEach((degree: any) => {
        degree.inactive_color = this.lightenColor(degree.color, 30);
      });
    } catch (error) {
      console.error('There was an error!', error);
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
        console.log(data);
        this.processData(data.data);
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }
  
  processData(data:any) {
    this.allMonitors = [{
        id: null
    }];
    let allNwds = [];
    let allBookings = [];

    for (const key in data) {
        const item = data[key];

        // Process 'monitor' field
        if (item.monitor) {
            this.allMonitors.push(item.monitor);
        }

        // Process 'nwds' field
        if (item.nwds && Array.isArray(item.nwds)) {
            allNwds.push(...item.nwds);
        }

        // Process 'bookings' field
        /*NO NEED TO GROUP WHEN CHANGE IN CALL*/
        /*allBookings.push(...item.bookings);*/
        if (item.bookings && typeof item.bookings === 'object') {
            for (const bookingKey in item.bookings) {
                const bookingArray = item.bookings[bookingKey];
                if (Array.isArray(bookingArray) && bookingArray.length > 0) {
                    const firstBooking = { ...bookingArray[0], bookings_number: bookingArray.length, bookings_clients: bookingArray };
                    allBookings.push(firstBooking);
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
          monitor = this.allMonitors.find(monitor => monitor.id === booking.monitor_id) || null;
        }
    
        return {
          booking_id: booking.id,
          date: moment(booking.date).format('YYYY-MM-DD'),
          date_full: booking.date,
          date_start: moment(booking.course.date_start).format('DD/MM/YYYY'),
          date_end: moment(booking.course.date_end).format('DD/MM/YYYY'),
          hour_start: booking.hour_start.substring(0, 5),
          hour_end: booking.hour_end ? booking.hour_end.substring(0, 5) : '20:00',
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
            // Default case if needed
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
          monitor = this.allMonitors.find(monitor => monitor.id === nwd.monitor_id) || null;
        }

        return {
          school_id: nwd.school_id,
          block_id: nwd.id,
          date: moment(nwd.start_date).format('YYYY-MM-DD'),
          date_format: moment(nwd.start_date).format('DD/MM/YYYY'),
          full_day: nwd.full_day,
          type: type,
          color: nwd.color,
          name: nwd.description,
          monitor_id: nwd.monitor_id,
          monitor: monitor,
          ...hourTimesNwd
        };
      })
    ];
    
    console.log('Combined Tasks Calendar:', tasksCalendar);

    this.calculateTaskPositions(tasksCalendar);

    // Additional processing if needed...
    console.log(this.allMonitors);
    console.log(allBookings);
    console.log(allNwds);
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

 async calculateTaskPositions(tasks:any) {
    const pixelsPerMinute = 220 / 60;
    const pixelsPerMinuteWeek = 400 / ((this.hoursRange.length - 1) * 60);
    let plannerTasks = tasks.map((task:any) => {
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

      const monitorIndex = this.allMonitors.findIndex(m => m.id === task.monitor_id);
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

    // Remove the original tasks that were grouped
    const filteredPlannerTasks = plannerTasks.filter(task => !groupedTaskIds.has(task.booking_id));

    // Combine adjusted tasks with the rest
    this.plannerTasks = [...filteredPlannerTasks, ...Object.values(groupedByDate).flat()];

    console.log('Planner Tasks:', this.plannerTasks);
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
    if(task.booking_id){
      if(task.grouped_tasks && task.grouped_tasks.length > 1){
        //Open Modal grouped courses
        this.groupedTasks = task.grouped_tasks;
        console.log(this.groupedTasks);
        this.idGroupedTasks = task.booking_id;
        this.showGrouped = true;
      }
      else{
        //Load course
        console.log(task);
        this.idDetail = task.booking_id;
        this.taskDetail = task;
        this.showDetail = true;
      }
      this.hideBlock();
    }
  }

  toggleBlock(block:any){
    console.log(block);
    this.idBlock = block.block_id;
    this.blockDetail = block;
    this.showBlock = true;
    this.hideDetail();
  }

  hideDetail() {
    this.idDetail = null;
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
    this.showGrouped = false;
  }

  toggleDetailMove(task: any, event: any) {
    event.preventDefault();
    if (task.booking_id) {
      const userConfirmed = window.confirm("Are you sure you want to move this task?");
  
      if (userConfirmed) {
        this.moveTask = true;
        this.taskMoved = task;
        console.log('MOVEEEE');
      } else {
        console.log('Move cancelled');
      }
    }
  }
  
  moveMonitor(monitor_id:any,event: MouseEvent): void {
    if (this.moveTask && monitor_id) {
      console.log('Grid row clicked');
      event.stopPropagation();

      console.log('CHANGE TO '+monitor_id);
      this.moveTask = false;
      this.taskMoved = null;
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
    }

    console.log(data);
    this.editedMonitor = null;
    this.showEditMonitor = false;
  }

}
