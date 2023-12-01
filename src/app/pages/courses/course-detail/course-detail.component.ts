import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { Observable, map, startWith } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_MONITORS } from 'src/app/static-data/monitors-data';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]
})
export class CourseDetailComponent implements OnInit {
  imagePath = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';
  imagePathPrivate = 'https://school.boukii.com/assets/icons/prive_ski2x.png';
  userAvatar = 'https://school.boukii.online/assets/icons/icons-outline-default-avatar.svg';

  today = new Date();
  form: UntypedFormGroup;
  monitorsForm = new FormControl();

  filteredMonitors: Observable<any[]>;

  durations: string[] = [];

  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores

  mockLevels = LEVELS;
  mockMonitors = MOCK_MONITORS;
  user: any;
  id: any;

  defaults: any;

  loading: boolean = true;
  constructor(private fb: UntypedFormBuilder, private crudService: ApiCrudService, private activatedRoute: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.id = this.activatedRoute.snapshot.params.id;

    this.generateDurations();
    this.mockLevels.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);
  }

  ngOnInit() {

    this.crudService.get('/admin/courses/'+this.id)
      .subscribe((data) => {
        this.defaults = data.data;
        this.defaults.course_dates = [];

        this.crudService.list('/course-dates', 1, 1000, 'desc', 'date', '&course_id='+this.id)
          .subscribe((courseDate) => {
            this.defaults.course_dates = courseDate.data;

            this.defaults.date_start_res = moment(this.defaults.date_start_res).format('DD-MM-YYYY');
            this.defaults.date_end_res = moment(this.defaults.date_end_res).format('DD-MM-YYYY');
            this.form = this.fb.group({
              fromDate: [''],
              dateTo: [''],
              participants: [''],
              duration: ['']
            });

            this.filteredMonitors = this.monitorsForm.valueChanges.pipe(
              startWith(''),
              map((value: any) => typeof value === 'string' ? value : value?.full_name),
              map(full_name => full_name ? this._filterMonitor(full_name) : this.mockMonitors.slice())
            );

            this.loading = false;
          })

      })

  }


  generateDurations() {
    let minutes = 15;
    const maxMinutes = 7 * 60; // 7 horas en minutos

    while (minutes <= maxMinutes) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      const durationString = `${hours ? hours + 'h ' : ''}${remainingMinutes}min`;
      this.durations.push(durationString);

      minutes += 15;
    }
  }

  displayFnMoniteurs(monitor: any): string {
    return monitor && monitor.full_name ? monitor.full_name : '';
  }

  private _filterMonitor(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockMonitors.filter(monitor => monitor.full_name.toLowerCase().includes(filterValue));
  }

  parseDateToDay(date:any, inFormat: string, format: string) {
    return moment(date, inFormat).format(format);
  }
}
