import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-course-user-transfer-timeline',
  templateUrl: './course-user-transfer-timeline.component.html',
  styleUrls: ['./course-user-transfer-timeline.component.scss']
})
export class CourseUserTransferTimelineComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  courseSubGroups: any = [];
  currentStudents: any = [];
  studentToChange: any = [];
  subGroupsToChange: any = null;
  clients: any = [];
  course: any = [];
  countries = MOCK_COUNTRIES;
  loading = true;
  user: any;
  groupedByColor = {};
  colorKeys: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private crudService: ApiCrudService, private snackbar: MatSnackBar) {

  }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));

    this.defaults.degrees.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);

    this.getClients();
    this.getData();


    //this.readSubGroups();
  }

  getData() {
    this.courseSubGroups = [];
    this.currentStudents = [];
    this.crudService.get('/admin/courses/'+this.defaults.id)
      .subscribe((data) => {
        this.course = data.data;

        this.course.course_dates.forEach(element => {
          if (moment(element.date, 'YYYY-MM-DD').format('YYYY-MM-DD') === this.defaults.currentDate.format('YYYY-MM-DD')) {
            element.groups.forEach(group => {
              group.subgroups.forEach(subgroup => {
                this.courseSubGroups.push(subgroup);
              });
            });
          }
        });

        this.crudService.list('/booking-users', 1, 1000, 'desc', 'id', '&course_id='+this.defaults.id)
            .subscribe((result) => {
              if (result.data.length > 0) {
                result.data.forEach(element => {
                  const exists = this.currentStudents.some(student => student.client_id === element.client_id);

                  if (!exists) {
                    const course = this.course.course_dates.find((c) => moment(c.date, 'YYYY-MM-DD').format('YYYY-MM-DD') === this.defaults.currentDate.format('YYYY-MM-DD'));
                    if (course) {
                      const group = course.groups.find((g) => g.course_date_id === element.course_date_id);

                      if (group) {

                        this.currentStudents.push(element);
                      }
                    }
                  }
                });
              }
              this.loading = false;
            });


      })
  }

  getClients() {
    this.crudService.list('/admin/clients/mains', 1, 10000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((data: any) => {
        this.clients = data.data;

      })
  }

  getClient(id: any) {
    if (id && id !== null) {
      return this.clients.find((c) => c.id === id);
    }
  }

  calculateAge(birthDateString) {
    if(birthDateString && birthDateString !== null) {
      const today = new Date();
      const birthDate = new Date(birthDateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }

      return age;
    } else {
      return 0;
    }

  }

  getNacionality(id: any) {
    const country = this.countries.find((c) => c.id === id);
    return country ? country.code : 'NDF';
  }

  addToStudentChangeList(event: any, item: any, idx: number) {
    if (event.checked) {
      this.studentToChange.push(item);
    } else {
      this.studentToChange.splice(idx, 1);
    }
  }

  onCheckboxChange(selectedIndex: number, isChecked: boolean, subGroup: any) {
    this.subGroupsToChange = subGroup;
    if (isChecked) {
      this.courseSubGroups.forEach((item, index) => {
        if (index !== selectedIndex) {
          item.checked = false; // Deseleccionar todos los otros checkboxes
        }
      });
    }
  }

  transferStudent() {
    const data = {
      initialSubgroupId: this.defaults.subgroup,
      targetSubgroupId: this.subGroupsToChange.id,
      clientIds: [],
      moveAllDays: true
    }
    this.studentToChange.forEach(element => {
      data.clientIds.push(element.client_id);
    });

    this.crudService.post('/clients/transfer', data)
      .subscribe((data) => {
        this.snackbar.open('Alumno transferido', 'OK', {duration: 3000});
        this.getData();
      })
  }

  getUserInSubGroup(subgroup: any) {
    let ret = 0;
    this.currentStudents.forEach(element => {
      if (element.course_subgroup_id === subgroup.id) {
        ret = ret + 1;
      }
    });

    return ret;
  }

  getCourseSubgroups(level: any) {
    let ret = [];

    this.courseSubGroups.forEach(element => {
      if (element.degree_id === level.id) {
        ret.push(element);
      }
    });

    return ret;
  }
}
