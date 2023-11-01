import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-salary-create-update-modal',
  templateUrl: './salary-create-update-modal.component.html',
  styleUrls: ['./salary-create-update-modal.component.scss']
})
export class SalaryCreateUpdateModalComponent implements OnInit {

  loading: boolean = true;
  form: UntypedFormGroup;
  mode: 'create' | 'update' = 'create';

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private dialogRef: MatDialogRef<any>, private fb: UntypedFormBuilder) {

  }

  ngOnInit(): void {

    this.form = this.fb.group({
      name: ['', Validators.required],
      payment: ['', Validators.required]
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
    const booking = this.form.value;

    if (!booking.imageSrc) {
      booking.imageSrc = 'assets/img/avatars/1.jpg';
    }

    this.dialogRef.close(booking);
  }

  update() {
    const booking = this.form.value;
    booking.id = this.defaults.id;

    this.dialogRef.close(booking);
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

}
