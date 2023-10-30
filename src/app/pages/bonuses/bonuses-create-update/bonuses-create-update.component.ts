import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { Observable, map, of, startWith } from 'rxjs';
import { CLIENTS } from 'src/app/static-data/clients-data';

@Component({
  selector: 'vex-bonuses-create-update',
  templateUrl: './bonuses-create-update.component.html',
  styleUrls: ['./bonuses-create-update.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]
})
export class BonusesCreateUpdateComponent implements OnInit {

  mode: 'create' | 'update' = 'create';
  defaults: any = null;


  loading: boolean = true;
  form: UntypedFormGroup;
  clientsForm = new FormControl('');
  filteredOptions: Observable<any[]>;

  mockClientsData = CLIENTS;

  constructor(private fb: UntypedFormBuilder) {
    this.form = this.fb.group({
      quantity:[null, Validators.required],
      budget:[null],
      pay:[false, Validators.required]
    });
  }

  ngOnInit() {
    this.filteredOptions = this.clientsForm.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.full_name),
      map(full_name => full_name ? this._filter(full_name) : this.mockClientsData.slice())
    );
  }

  save() {
    if (this.mode === 'create') {
      this.create();
    } else if (this.mode === 'update') {
      this.update();
    }
  }

  create() {
  }

  update() {

  }

  // pasar a utils
  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockClientsData.filter(client => client.full_name.toLowerCase().includes(filterValue));
  }


  displayFn(client: any): string {
    return client && client.full_name ? client.full_name : '';
  }
}
