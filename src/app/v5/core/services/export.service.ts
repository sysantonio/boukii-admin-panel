import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportBookings(bookings: any[]): Observable<void> {
    // Mock export functionality
    console.log('Exporting bookings:', bookings);
    return of(void 0).pipe(delay(1000));
  }

  exportAllBookings(filters: any): Observable<void> {
    // Mock export functionality
    console.log('Exporting all bookings with filters:', filters);
    return of(void 0).pipe(delay(1500));
  }
}