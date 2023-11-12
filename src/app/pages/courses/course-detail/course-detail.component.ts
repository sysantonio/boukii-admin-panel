import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_MONITORS } from 'src/app/static-data/monitors-data';

@Component({
  selector: 'vex-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  imagePath = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';
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

  constructor(private fb: UntypedFormBuilder) {
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
}
