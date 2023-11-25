import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-salary-create-update-modal',
  templateUrl: './salary-create-update-modal.component.html',
  styleUrls: ['./salary-create-update-modal.component.scss']
})
export class SalaryCreateUpdateModalComponent implements OnInit {

  loading: boolean = true;
  form: UntypedFormGroup;
  mode: 'create' | 'update' = 'create';

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private dialogRef: MatDialogRef<any>, private fb: UntypedFormBuilder,
    private crudService: ApiCrudService, private snackbar: MatSnackBar) {

  }

  ngOnInit(): void {

    if(this.defaults !== null && this.defaults.id) {
      this.mode = 'update';
    } else {

      this.mode = 'create';
    }

    this.form = this.fb.group({
      name: ['', Validators.required],
      pay: ['', Validators.required],
      active: [false, Validators.required]
    })

    this.loading = false;
  }

  save() {
    if (this.mode === 'create') {
      this.create();
    } else if (this.mode === 'update') {
      this.update();
    }
  }

  create() {
    const data = this.form.value;
    data.school_id = 1;
    this.crudService.create('/school-salary-levels', data)
      .subscribe((data) => {
        this.snackbar.open('Salario creado correctamente', 'OK', {duration: 3000})
        this.dialogRef.close(data);
      })
  }

  update() {
    const data = this.form.value;
    data.school_id = 1;
    this.crudService.update('/school-salary-levels', data, this.defaults.id)
      .subscribe((data) => {
        this.snackbar.open('Salario modificado correctamente', 'OK', {duration: 3000})
        this.dialogRef.close(data);
      })
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

}
