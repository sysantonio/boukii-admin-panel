import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-widget-assistant',
  templateUrl: './widget-assistant.component.html',
  styleUrls: ['./widget-assistant.component.scss']
})
export class WidgetAssistantComponent implements OnInit {

  user: any;
  today;
  weather;
  constructor(private translateService: TranslateService, private crudService: ApiCrudService) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.today = moment().locale(this.translateService.currentLang).format('ll');
    this.getWeather();
  }

  getWeather() {
    this.crudService.get('/admin/weather')
      .subscribe((data) => {
        this.weather = data.data;
      })
  }
}
