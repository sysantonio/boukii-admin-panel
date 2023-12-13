import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { ApiCrudService } from 'src/service/crud.service';
import { CommonModule } from '@angular/common';
import { Observable, map, startWith } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'vex-calendar-edit',
  templateUrl: './calendar-edit.component.html',
  styleUrls: ['./calendar-edit.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatSelectModule,
    CommonModule
  ]
})
export class CalendarEditComponent implements OnInit {
  selectedBlockage: any = null;
  myControlStations = new FormControl();
  filteredStations: Observable<any[]>;
  blockageSelected = null;
  selectedIndex = 0;
  times: string[] = this.generateTimes();
  type = 0;
  form: UntypedFormGroup;

  defaults = {
    start_date: null,
    end_date: null,
    start_time: null,
    end_time: null,
    monitor_id: null,
    school_id: null,
    station_id: null,
    full_day: false,
    description: null,
    color: null,
    user_nwd_subtype_id: null,
  };
  filteredTimes: any = [];
  blockages: any = [];
  stations: any = [];
  user:any;
  loading = true;
  constructor(
    private dialogRef: MatDialogRef<CalendarEditComponent>,
    @Inject(MAT_DIALOG_DATA) public event: any,
    private fb: UntypedFormBuilder, private crudService: ApiCrudService
  ) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));;

    this.form = this.fb.group({
      startAvailable: null,
      endAvailable: null,
      startNonAvailable: null,
      endNonAvailable: null,
      startPayedBlock: null,
      endPayedBlock: null,
      startNonPayedBlock: null,
      endNonPayedBlock: null,
      description: null,
      station: null,
      blockage: null
    });

    this.getStations();
    this.getBlockages();
    this.filteredStations = this.myControlStations.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterStations(value))
      );

      this.myControlStations.valueChanges.subscribe(value => {
        this.form.get('station').setValue(value);
    });
  }

  onStartTimeChange() {
    const index = this.times.indexOf(this.defaults.start_time);
    if (index !== -1 && index < this.times.length - 1) {
      this.filteredTimes = this.times.slice(index + 1);
    } else {
      this.filteredTimes = [];
    }
  }

  save() {
    if (this.type === 0 || this.type === 1) {
      this.defaults.color = '#89add1';
    }

    this.defaults.user_nwd_subtype_id = this.type;
    this.defaults.school_id = this.user.schools[0].id;
    this.defaults.start_date = moment(this.defaults.start_date).format('YYYY-MM-DD');
    this.defaults.end_date = moment(this.defaults.start_date).format('YYYY-MM-DD');

    this.dialogRef.close({
      ...this.event,
      ...this.defaults
    });
  }

  private _filterStations(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.stations.filter(option => option.name.toLowerCase().includes(filterValue));
  }


  generateTimes(): string[] {
    let times = [];
    let dt = new Date(2023, 0, 1, 8, 0, 0, 0);
    const end = new Date(2023, 0, 1, 17, 55, 0, 0);

    while (dt <= end) {
      const time = ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
      times.push(time);
      dt.setMinutes(dt.getMinutes() + 5); // Incrementa en 5 minutos
    }
    return times;
  }


  getBlockages() {
    this.crudService.list('/school-colors', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((data) => {
        this.blockages = data.data;

        if(this.event && this.event.start) {
          this.defaults.start_date = this.event.start;
          this.defaults.end_date = this.event.end;
          this.defaults.start_time = this.event.start_time.substring(0, this.event.start_time.length-3);;
          this.defaults.end_time = this.event.end_time.substring(0, this.event.end_time.length-3);;
          this.defaults.color = this.event.color;
          this.defaults.full_day = this.event.allDay;
          this.defaults.user_nwd_subtype_id = this.event.user_nwd_subtype_id;
          this.selectedIndex = this.event.user_nwd_subtype_id;
          this.type = this.event.user_nwd_subtype_id;

          this.blockageSelected = this.blockages.find((b) => b.color === this.event.color);
          this.onStartTimeChange();
        }
        this.loading = false;
      })
  }

  getStations() {
    this.crudService.list('/stations-schools', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((station) => {
        station.data.forEach(element => {
          this.crudService.get('/stations/'+element.id)
            .subscribe((data) => {
              this.stations.push(data.data);

            })
        });
      })
  }

  onTabChanged(event: any) {

    this.form.reset();
    this.type = event.index;

    if(this.event && this.event.start) {
      this.defaults.start_date = this.event.start;
      this.defaults.end_date = this.event.end;
      this.defaults.start_time = this.event.start_time.substring(0, this.event.start_time.length-3);;
      this.defaults.end_time = this.event.end_time.substring(0, this.event.end_time.length-3);;
      this.defaults.color = this.event.color;
      this.defaults.full_day = this.event.allDay;
      this.defaults.user_nwd_subtype_id = this.event.user_nwd_subtype_id;
      this.blockageSelected = this.blockages.find((b) => b.color === this.event.color);

      this.onStartTimeChange();
    } else {
      this.defaults = {
        start_date: null,
        end_date: null,
        start_time: null,
        end_time: null,
        monitor_id: null,
        school_id: null,
        station_id: null,
        full_day: false,
        description: null,
        color: null,
        user_nwd_subtype_id: this.type,
      };
    }

  }
}
