import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'booking-detaiil-dialog',
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.scss']
})
export class BookingDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
