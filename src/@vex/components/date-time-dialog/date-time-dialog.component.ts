import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'vex-date-time-dialog',
  templateUrl: './date-time-dialog.component.html',
  styleUrls: ['./date-time-dialog.component.scss']
})
export class DateTimeDialogComponent implements OnInit {


  today = new Date();
  startView = 'month';  // Puedes cambiar esto a 'year' si prefieres una vista diferente al abrir el datepicker.
  hours: string[] = [];
  selectedHour: string;
  selectedDate: Date;

  constructor() { }

  ngOnInit(): void {
    this.generateHours();
  }

  generateHours() {
    for (let i = 8; i <= 17; i++) {
      for (let j = 0; j < 60; j += 5) {
        const formattedHour = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
        this.hours.push(formattedHour);
      }
    }
  }
}
