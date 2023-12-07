import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map, startWith } from 'rxjs';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-add-discount-bonus',
  templateUrl: './add-discount-bonus.component.html',
  styleUrls: ['./add-discount-bonus.component.scss']
})
export class AddDiscountBonusModalComponent implements OnInit {

  bonuses: any;
  bonus: any;
  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private crudService: ApiCrudService) {

  }

  ngOnInit(): void {

    this.crudService.list('/vouchers', 1, 1000, 'asc', 'first_name', '&school_id='+this.defaults.school_id + '&client_id='+this.defaults.client_id)
      .subscribe((data) => {
        this.bonuses = data.data;
      })
  }
}
