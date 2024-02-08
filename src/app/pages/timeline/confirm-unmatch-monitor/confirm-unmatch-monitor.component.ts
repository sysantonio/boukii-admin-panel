import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-confirm-unmatch-monitor',
  templateUrl: './confirm-unmatch-monitor.component.html',
  styleUrls: ['./confirm-unmatch-monitor.component.scss']
})
export class ConfirmUnmatchMonitorComponent implements OnInit {

  problem: string = '';
  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private crudService: ApiCrudService) {

  }

  ngOnInit() {
    console.log(this.defaults);
    const monitorLanguages = {
      "language1_id": this.defaults.monitor.language1_id,
      "language2_id": this.defaults.monitor.language2_id,
      "language3_id": this.defaults.monitor.language3_id,
      "language4_id": this.defaults.monitor.language4_id,
      "language5_id": this.defaults.monitor.language5_id,
      "language6_id": this.defaults.monitor.language6_id
    };

    if (this.defaults.booking.course.course_type === 2) {
      this.defaults.booking.all_clients.forEach(client => {
        const clientLanguages = {
          "language1_id": client.client.language1_id,
          "language2_id": client.client.language2_id,
          "language3_id": client.client.language3_id,
          "language4_id": client.client.language4_id,
          "language5_id": client.client.language5_id,
          "language6_id": client.client.language6_id
        };


        if (!this.langMatch(monitorLanguages, clientLanguages)) {
          this.problem = 'language_match';
        }
      });
    } else {

      this.defaults.booking.all_clients.forEach(client => {
        const clientLanguages = {
          "language1_id": client.client.language1_id,
          "language2_id": client.client.language2_id,
          "language3_id": client.client.language3_id,
          "language4_id": client.client.language4_id,
          "language5_id": client.client.language5_id,
          "language6_id": client.client.language6_id
        };

        if (!this.langMatch(monitorLanguages, clientLanguages)) {
          this.problem = 'language_match';
        } else {
          this.crudService.list('/monitor-sports-degrees', 1, 1000, 'desc', 'id', '&monitor_id='+this.defaults.monitor.id+'&school_id='+this.defaults.school_id+'&sport_id='+this.defaults.booking.sport_id)
          .subscribe((data) => {
            this.defaults.monitor.degrees = data.data;
            this.problem = 'degree_match';

            this.crudService.list('/monitor-sport-authorized-degrees', 1, 1000, 'desc', 'id', '&monitor_id='+this.defaults.monitor.id+'&school_id='+this.defaults.school_id+'&monitor_sport_id='+data.data[0].id)
          .subscribe((authsD) => {
            authsD.data.forEach(element => {
              if (element.degree_id === this.defaults.booking.degree_id) {
                this.problem = '';
              }
            });
          });

          })
        }
      });
    }
  }

  langMatch(objeto1, objeto2) {
    for (const key in objeto1) {
        if (objeto1[key] !== null && objeto1[key] === objeto2[key]) {
            return true;
        }
    }
    return false;
  }
}
