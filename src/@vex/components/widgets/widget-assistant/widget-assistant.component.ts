import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';

@Component({
  selector: 'vex-widget-assistant',
  templateUrl: './widget-assistant.component.html',
  styleUrls: ['./widget-assistant.component.scss']
})
export class WidgetAssistantComponent implements OnInit {

  user: any;
  today;
  constructor(private translateService: TranslateService) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.today = moment().locale(this.translateService.currentLang).format('LLLL');
  }

}
