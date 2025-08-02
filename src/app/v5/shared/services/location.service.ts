import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interfaces
import { Location } from '../models/location.interface';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  getLocations(): Observable<Location[]> {
    // Mock data
    const mockLocations: Location[] = [
      {
        id: 1,
        name: 'Playa de La Concha',
        address: 'San Sebastián'
      },
      {
        id: 2,
        name: 'Playa de Zurriola',
        address: 'San Sebastián'
      }
    ];

    return of(mockLocations).pipe(delay(300));
  }
}