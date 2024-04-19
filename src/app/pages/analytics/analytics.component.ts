import { Component } from '@angular/core';
import {BonusesCreateUpdateComponent} from '../bonuses/bonuses-create-update/bonuses-create-update.component';

@Component({
  selector: 'vex-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent {

    protected readonly createComponent = BonusesCreateUpdateComponent;
}
