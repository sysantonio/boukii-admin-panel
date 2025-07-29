import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();
  private counter = 0;

  constructor() {}

  start(): void {
    this.counter++;
    if (this.counter === 1) {
      this.loadingSubject.next(true);
    }
  }

  stop(): void {
    if (this.counter > 0) {
      this.counter--;
      if (this.counter === 0) {
        this.loadingSubject.next(false);
      }
    }
  }
}
