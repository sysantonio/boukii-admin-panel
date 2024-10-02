import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'vex-course-componente-extras',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class CourseComponenteExtrasComponent implements OnInit {
  @Input() courseFormGroup: UntypedFormGroup
  @Input() mode: "create" | "update"
  @Input() extras: any = []
  extrasModal: boolean = false
  extrasFormGroup: UntypedFormGroup; //crear extras nuevas
  constructor(private fb: UntypedFormBuilder) { }
  ngOnInit(): void {
    this.extrasFormGroup = this.fb.group({
      id: ["", Validators.required],
      product: ["", Validators.required],
      name: ["", Validators.required],
      price: ["", Validators.required],
      iva: ["", Validators.required],
      status: ["", Validators.required],
    })
  }
  selectExtra = (event: any, item: any) => {
    const extras = this.courseFormGroup.controls['extras'].value
    if (event.checked || !extras.find((a: any) => a.id === item.id)) this.courseFormGroup.patchValue({ extras: [...extras, item] })
    else this.courseFormGroup.patchValue({ extras: extras.filter((a: any) => a.id !== item.id) })
  }

}
