import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatCalendarCellCssClasses } from "@angular/material/datepicker";
import moment from "moment";
import { ApiCrudService } from "src/service/crud.service";

@Component({
  selector: "booking-step-four",
  templateUrl: "./step-four.component.html",
  styleUrls: ["./step-four.component.scss"],
})
export class StepFourComponent {
  @Input() initialData: any;
  @Input() client: any;
  @Input() sportLevel: any;
  @Output() stepCompleted = new EventEmitter<FormGroup>();
  @Output() prevStep = new EventEmitter();
  stepForm: FormGroup;
  selectedDate;
  selectedCourse;
  courseTypeId: number = 2;
  user;
  courses = [];
  minDate;
  coursesDate = [];
  cursesInSelectedDate = [];
  isLoading = true;
  selectedDateMoment;

  constructor(private fb: FormBuilder, private crudService: ApiCrudService) {
    this.selectedCourse = this.initialData?.selectedCourse;
    this.selectedDate = this.initialData?.selectedDate;
    this.selectedDateMoment = this.selectedDate
      ? moment(this.selectedDate)
      : null;
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("boukiiUser"));
    this.stepForm = this.fb.group({
      date: [this.selectedDate || this.minDate, Validators.required],
      course: [this.selectedCourse, Validators.required],
    });
    this.getCourses(this.sportLevel);
  }

  isFormValid() {
    return this.stepForm.valid;
  }

  handlePrevStep() {
    this.prevStep.emit();
  }

  completeStep() {
    if (this.isFormValid()) {
      this.stepCompleted.emit(this.stepForm);
    }
  }

  handleDateChange(event: any) {
    this.selectedDate = event;
    this.selectedDateMoment = moment(event);
    this.stepForm.get("date").patchValue(this.selectedDateMoment);
    this.cursesInSelectedDate = this.courses.filter((course) =>
      course.course_dates.find((d) =>
        this.selectedDateMoment.isSame(moment(d.date), "day")
      )
    );
  }

  compareCourseDates() {
    let ret = [];
    this.courses.forEach((course) => {
      course.course_dates.forEach((courseDate) => {
        ret.push(moment(courseDate.date, "YYYY-MM-DD").format("YYYY-MM-DD"));
      });
    });

    this.coursesDate = ret;
  }

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      const currentDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");
      if (
        this.coursesDate.indexOf(currentDate) !== -1 &&
        moment(this.minDate, "YYYY-MM-DD")
          .startOf("day")
          .isSameOrBefore(moment(date, "YYYY-MM-DD").startOf("day"))
      ) {
        return "with-course";
      } else {
        return;
      }
    };
  }

  getCourses(sportLevel: any, date?: any) {
    let minDate, maxDate;
    minDate = date ? moment(date) : moment();
    maxDate = moment().endOf("month");
    const rq = {
      start_date: minDate.format("YYYY-MM-DD"),
      end_date: maxDate.format("YYYY-MM-DD"),
      course_type: this.courseTypeId,
      sport_id: sportLevel.sport_id,
      client_id: this.client.client_id,
      degree_id: sportLevel.id,
      get_lower_degrees: false,
      school_id: this.user.schools[0].id,
    };
    this.isLoading = true;
    this.crudService.post("/availability", rq).subscribe((data) => {
      this.courses = data.data;
      this.compareCourseDates();
      this.isLoading = false;
    });
  }
}
