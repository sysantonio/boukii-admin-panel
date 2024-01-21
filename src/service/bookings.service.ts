
import { Injectable } from '@angular/core';
import { ApiCrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  public editData: any = {};

  constructor() {
  }
}

