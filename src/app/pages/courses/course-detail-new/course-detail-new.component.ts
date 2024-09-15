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
  course: any;
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
  courseFormGroup: UntypedFormGroup;

  ngOnInit(): void {
    this.getCourseData();
  }

  getCourseData() {
    this.crudService.get('/admin/courses/' + this.id,
      ['courseGroups.degree', 'courseGroups.courseDates.courseSubgroups.bookingUsers.client','sport'])
      .subscribe((data: any) => {
        const event = { item: data.data }
        console.log(event)
        this.courseFormGroup = this.fb.group({
          id: [event.item.id, Validators.required], //Solo listado
          user: [event.item.user, Validators.required], //Solo listado
          created_at: [event.item.created_at, Validators.required], //Solo listado
          active: [event.item.active, Validators.required], //Solo listado
          online: [event.item.online, Validators.required], //Solo listado

          sport_id: [event.item.sport_id, Validators.required],
          course_type: [event.item.course_type, Validators.required],
          course_name: [event.item.name, Validators.required],
          summary: [event.item.short_description, Validators.required],
          description: [event.item.description, Validators.required],
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
          price: [event.item.price, Validators.required],
          participants: [event.item.max_participants, Validators.required],
          img: [event.item.image, Validators.required],
          icon: [event.item.sport.icon_unselected, Validators.required],
          age_max: [event.item.age_max, Validators.required],
          age_min: [event.item.age_min, Validators.required],
          reserve_from: [event.item.date_start, Validators.required],
          reserve_to: [event.item.date_end, Validators.required],
          duration_min: [event.item.duration, Validators.required],
          reserve_date: [event.item.course_dates, Validators.required],
          discount: [[], Validators.required],
          extras: [[], Validators.required],
          levelGrop: [[], Validators.required],
        });
        this.course = data.data;
        this.shortDescription = this.courseService.getShortDescription(this.course);
        this.courseName = this.courseService.getCourseName(this.course);
        this.firstCombinationValue = this.courseService.findFirstCombinationWithValues(this.course.price_range);
        this.description = this.courseService.getDescription(this.course);
        this.ageRange = this.courseService.getAgeRange(this.course.course_dates[0].course_groups);
        this.shortestDuration = this.courseService.getShortestDuration(this.course.course_dates);
        this.loading = false;
      })
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  parseDateToDay(date: string, fromFormat: string, toFormat: string): string {
    return this.courseService.parseDateToDay(date, fromFormat, toFormat);
  }

}
