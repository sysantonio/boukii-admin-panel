import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiCrudService } from '../../../../service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment/moment';
import { CoursesService } from '../../../../service/courses.service';

@Component({
  selector: 'vex-course-detail-new',
  templateUrl: './course-detail-new.component.html',
  styleUrls: ['./course-detail-new.component.scss']
})
export class CourseDetailNewComponent implements OnInit {

  user: any;
  settings: any;
  id: number;
  loading: boolean = true;
  shortDescription: string = '';
  courseName: string = '';
  firstCombinationValue: number | null = null;
  description: string = '';
  ageRange: { age_min: number, age_max: number } = { age_min: 0, age_max: 0 };
  shortestDuration: string | null = null;

  constructor(private fb: UntypedFormBuilder, private crudService: ApiCrudService,
    private activatedRoute: ActivatedRoute, private router: Router,
    private dialog: MatDialog, private courseService: CoursesService,
    private snackbar: MatSnackBar, private translateService: TranslateService) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.settings = JSON.parse(this.user.schools[0].settings);
    this.id = this.activatedRoute.snapshot.params.id;

  }
  courseFormGroup!: UntypedFormGroup;
  detailData: any
  ngOnInit(): void {
    this.getCourseData();
  }

  getCourseData() {
    this.crudService.get('/admin/courses/' + this.id,
      ['courseGroups.degree', 'courseGroups.courseDates.courseSubgroups.bookingUsers.client', 'sport'])
      .subscribe((data: any) => {
        this.detailData = data.data
        this.crudService.list('/degrees', 1, 10000, 'asc', 'degree_order', '&school_id=' + this.detailData.school_id + '&sport_id=' + this.detailData.sport_id)
          .subscribe((data) => {
            this.detailData.degrees = [];
            data.data.forEach(element => {
              if (element.active) this.detailData.degrees.push({ ...element, Subgrupo: this.getSubGroups(element.id) });
            });
            this.detailData.degrees.forEach(level => {
              level.active = false;
              this.detailData.course_dates.forEach(cs => {
                cs.course_groups.forEach(group => {
                  if (group.degree_id === level.id) {
                    level.active = true;
                    level.old = true;
                  } level.visible = false;
                });
              });
            });
            this.crudService.list('/stations', 1, 10000, 'desc', 'id', '&school_id=' + this.detailData.school_id)
              .subscribe((st) => {
                st.data.forEach(element => {
                  if (element.id === this.detailData.station_id) this.detailData.station = element
                });
                this.crudService.list('/booking-users', 1, 10000, 'desc', 'id', '&school_id=' + this.detailData.school_id + '&course_id=' + this.detailData.id)
                  .subscribe((bookingUser) => {
                    this.detailData.users = [];
                    this.detailData.users = bookingUser.data;
                    console.log(this.detailData)
                    this.courseFormGroup = this.fb.group({
                      id: [this.detailData.id, Validators.required], //Solo listado
                      user: [this.detailData.user, Validators.required], //Solo listado
                      created_at: [this.detailData.created_at, Validators.required], //Solo listado
                      active: [this.detailData.active, Validators.required], //Solo listado
                      online: [this.detailData.online, Validators.required], //Solo listado
                      sport_id: [this.detailData.sport_id, Validators.required],
                      course_type: [this.detailData.course_type, Validators.required],
                      course_name: [this.detailData.name, Validators.required],
                      summary: [this.detailData.short_description, Validators.required],
                      description: [this.detailData.description, Validators.required],
                      course_name_es: ["", Validators.required],
                      summary_es: ["", Validators.required],
                      description_es: ["", Validators.required],
                      course_name_fr: ["", Validators.required],
                      summary_fr: ["", Validators.required],
                      description_fr: ["", Validators.required],
                      course_name_en: ["", Validators.required],
                      summary_en: ["", Validators.required],
                      description_en: ["", Validators.required],
                      course_name_de: ["", Validators.required],
                      summary_de: ["", Validators.required],
                      description_de: ["", Validators.required],
                      course_name_it: ["", Validators.required],
                      summary_it: ["", Validators.required],
                      description_it: ["", Validators.required],
                      price: [this.detailData.price, Validators.required],
                      participants: [this.detailData.max_participants, Validators.required],
                      img: [this.detailData.image, Validators.required],
                      icon: [this.detailData.sport.icon_unselected, Validators.required],
                      age_max: [this.detailData.age_max, Validators.required],
                      age_min: [this.detailData.age_min, Validators.required],
                      reserve_from: [this.detailData.date_start, Validators.required],
                      reserve_to: [this.detailData.date_end, Validators.required],
                      duration_min: [this.detailData.duration, Validators.required],
                      reserve_date: [this.detailData.course_dates, Validators.required],
                      discount: [[], Validators.required],
                      extras: [[], Validators.required],
                      levelGrop: [this.detailData.degrees, Validators.required],
                    });
                    setTimeout(() => this.loading = false, 0);
                  })
              })
          });
      })
  }

  goTo(route: string, query: any = null) {
    this.router.navigate([route], { queryParams: query });
  }

  parseDateToDay(date: string, fromFormat: string, toFormat: string): string {
    return this.courseService.parseDateToDay(date, fromFormat, toFormat);
  }
  getSubGroups(levelId: any) {
    let ret = 0;

    this.detailData.course_dates.forEach(courseDate => {
      let find = false;
      courseDate.course_groups.forEach(group => {
        if (group.degree_id === levelId && !find) {
          ret = group.course_subgroups[0]?.max_participants;
          find = true;
        }
      });

    });

    return ret;
  }
  DateDiff = (value1: string, value2: string): number => Math.round((new Date(value2).getTime() - new Date(value1).getTime()) / 1000 / 60 / 60 / 24)

}
