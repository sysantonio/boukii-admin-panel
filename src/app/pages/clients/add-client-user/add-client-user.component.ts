import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map, startWith } from 'rxjs';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-add-client-user',
  templateUrl: './add-client-user.component.html',
  styleUrls: ['./add-client-user.component.scss']
})
export class AddClientUserModalComponent implements OnInit {

  languagesControl = new FormControl([]);
  filteredLanguages: Observable<any[]>;
  selectedLanguages = [];
  maxSelection = 6;
  languages = [];
  form: UntypedFormGroup;

  ret: any = null;
  loading: any = true;
  clientsForm = new FormControl('');
  filteredOptions: Observable<any[]>;
  clients = [];
  today: Date;
  minDate: Date;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private crudService: ApiCrudService, private snackbar: MatSnackBar,
    private fb: UntypedFormBuilder, private dialogRef: MatDialogRef<any>, private translateService: TranslateService) {

    this.today = new Date();
    this.minDate = new Date(this.today);
    this.minDate.setFullYear(this.today.getFullYear() - 3);
  }

  ngOnInit(): void {

    this.crudService.list('/clients', 1, 1000, 'asc', 'first_name', '&school_id='+this.defaults.id)
      .subscribe((data) => {
        this.clients = data.data;
        this.getLanguages()
        this.filteredOptions = this.clientsForm.valueChanges.pipe(
          startWith(''),
          map((value: any) => typeof value === 'string' ? value : value?.full_name),
          map(full_name => full_name ? this._filter(full_name) : this.clients.slice())
        );

        this.form = this.fb.group({
          name: [null, Validators.required],
          surname: [null, Validators.required],
          fromDate: [null, Validators.required]
        })
      })
  }

  getLanguages() {
    this.crudService.list('/languages', 1, 1000)
      .subscribe((data) => {
        this.languages = data.data.reverse();
        this.filteredLanguages = this.languagesControl.valueChanges.pipe(
          startWith(''),
          map(language => (language ? this._filterLanguages(language) : this.languages.slice()))
        );

        this.loading = false;
      })
  }

  save() {
    const data = this.form.value;
    data.languages = this.selectedLanguages;
    this.dialogRef.close({
      action: 'new',
      data: data,
    })
  }

  getSelectedLanguageNames(): string {
    return this.selectedLanguages.map(language => language.name).join(', ');
  }

  toggleSelectionLanguages(language: any): void {
    if (this.selectedLanguages.length < this.maxSelection) {

      const index = this.selectedLanguages.findIndex(l => l.code === language.code);
      if (index >= 0) {
        this.selectedLanguages.splice(index, 1);
      } else {
        this.selectedLanguages.push({ id: language.id, name: language.name, code: language.code });
      }
    } else {
      this.snackbar.open(this.translateService.instant('snackbar.admin.langs'), 'OK', {duration: 3000});
    }
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.clients.filter(client => (client.first_name.toLowerCase().includes(filterValue) || client.last_name.toLowerCase().includes(filterValue)));
  }

  private _filterLanguages(value: any): any[] {
    const filterValue = value?.toLowerCase();
    return this.languages.filter(language => language?.name.toLowerCase().includes(filterValue));
  }

  displayFn(client: any): string {
    return client && (client?.first_name && client?.last_name) ? client?.first_name + ' ' + client?.last_name : client?.first_name;
  }
}
