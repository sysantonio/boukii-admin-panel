import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SmartBookingService } from '../../services/smart-booking.service';
import { SMART_BOOKING_SERVICE } from '../../services/service.factory';

@Component({
  selector: 'app-cancel-booking-dialog',
  templateUrl: './cancel-booking-dialog.component.html'
})
export class CancelBookingDialogComponent {
  loading = false;
  reason = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    @Inject(SMART_BOOKING_SERVICE) private bookingService: SmartBookingService,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<CancelBookingDialogComponent>
  ) {}

  async confirm() {
    this.loading = true;
    try {
      await this.bookingService.cancelBooking(this.data.id, this.reason);
      this.snackbar.open('Reserva cancelada', undefined, { duration: 3000 });
      this.dialogRef.close(true);
    } catch (err: any) {
      this.snackbar.open(err?.message || 'Error al cancelar', undefined, { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }
}
