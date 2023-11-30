import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map, startWith } from 'rxjs';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-add-client-user',
  templateUrl: './add-client-user.component.html',
  styleUrls: ['./add-client-user.component.scss']
})
export class AddClientUserModalComponent implements OnInit {

  ret: any;
  clientsForm = new FormControl('');
  filteredOptions: Observable<any[]>;
  clients = [];

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private crudService: ApiCrudService) {

  }

  ngOnInit(): void {

    this.crudService.list('/clients', 1, 1000, 'asc', 'first_name', '&school_id='+this.defaults.id)
      .subscribe((data) => {
        this.clients = data.data;

        this.filteredOptions = this.clientsForm.valueChanges.pipe(
          startWith(''),
          map((value: any) => typeof value === 'string' ? value : value?.full_name),
          map(full_name => full_name ? this._filter(full_name) : this.clients.slice())
        );
      })
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.clients.filter(client => (client.first_name.toLowerCase().includes(filterValue) || client.last_name.toLowerCase().includes(filterValue)));
  }

  displayFn(client: any): string {
    return client && (client.first_name && client.last_name) ? client.first_name + ' ' + client.last_name : client.first_name;
  }
}
