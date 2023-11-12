import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'vex-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  imagePath = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';

  today = new Date();
  form: UntypedFormGroup;

  durations: string[] = [];


  constructor(private fb: UntypedFormBuilder) {
    this.generateDurations();

  }

  ngOnInit() {
    this.form = this.fb.group({
      fromDate: [''],
      dateTo: [''],
      participants: [''],
      duration: ['']
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
}
