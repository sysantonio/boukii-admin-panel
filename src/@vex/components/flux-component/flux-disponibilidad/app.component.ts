import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-flux-disponibilidad',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class FluxDisponibilidadComponent implements OnInit {
  cambiarModal: boolean = false
  @Input() mode: 'create' | 'update' = "create"
  @Input() courseFormGroup!: UntypedFormGroup
  @Input() level!: any
  @Input() group!: any
  @Input() subgroup!: any
  @Input() subgroup_index!: number

  @Output() monitorSelect = new EventEmitter<any>()

  ISODate = (n: number) => new Date(new Date().getTime() + n * 24 * 60 * 60 * 1000).toLocaleString()
  find = (array: any[], key: string, value: string) => array.find((a: any) => a[key] === value)

  displayFn = (value: any): string => value
  selectDate: number = 0
  constructor(private crudService: ApiCrudService) { }
  getLanguages = () => this.crudService.list('/languages', 1, 1000).subscribe((data) => this.languages = data.data.reverse())
  getLanguage(id: any) {
    const lang: any = this.languages.find((c: any) => c.id == +id);
    return lang ? lang.code.toUpperCase() : 'NDF';
  }
  countries = MOCK_COUNTRIES;
  languages = [];
  getCountry(id: any) {
    const country = this.countries.find((c) => c.id == +id);
    return country ? country.name : 'NDF';
  }
  calculateAge(birthDateString: any) {
    if (birthDateString && birthDateString !== null) {
      const today = new Date();
      const birthDate = new Date(birthDateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    } else return 0;
  }
  async getAvailable(data: any) {
    return await firstValueFrom(this.crudService.post('/admin/monitors/available', data))
  }
  monitors: any[] = []
  async ngOnInit() {
    for await (const item of this.courseFormGroup.controls['course_dates'].value) {
      const monitor = await this.getAvailable({ date: item.date, endTime: item.hour_end, minimumDegreeId: this.level.id, sportId: this.courseFormGroup.controls['sport_id'].value, startTime: item.hour_start })
      this.monitors.push(monitor.data)
    }
  }
}


