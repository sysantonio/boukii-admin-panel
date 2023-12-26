
import { Injectable } from '@angular/core';
import { ApiCrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {

  public schoolSettings: any;
  user: any;
  constructor(private crudService: ApiCrudService) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
  }

  refreshSchoolData() {
    this.crudService.get('/schools/'+this.user.schools[0].id)
      .subscribe((data) => {
        this.schoolSettings = data.data;
      })
  }

  getSchoolData(user = null) {
    if (this.user) {

      return this.crudService.get('/schools/'+this.user.schools[0].id);
    }
  }
}

