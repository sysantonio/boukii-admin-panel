import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SkiProBooking } from '../../interfaces/skipro.interfaces';

@Component({
  selector: 'app-booking-detail-modal',
  templateUrl: './booking-detail-modal.component.html'
})
export class BookingDetailModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public booking: SkiProBooking,
    private dialogRef: MatDialogRef<BookingDetailModalComponent>,
    private router: Router
  ) {}

  edit() {
    this.dialogRef.close();
    this.router.navigate(['/bookings-v3/skipro/wizard', this.booking.id]);
  }

  close() {
    this.dialogRef.close();
  }
}
