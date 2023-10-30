import { Component } from '@angular/core';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';

@Component({
  selector: 'vex-monitors-create-update',
  templateUrl: './monitors-create-update.component.html',
  styleUrls: ['./monitors-create-update.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]
})
export class MonitorsCreateUpdateComponent {

}
