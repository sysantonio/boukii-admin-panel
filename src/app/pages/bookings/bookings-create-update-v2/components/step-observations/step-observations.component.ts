import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "booking-step-observations",
  templateUrl: "./step-observations.component.html",
  styleUrls: ["./step-observations.component.scss"],
})
export class StepObservationsComponent implements OnInit {
  @Input() initialData: any;
  @Output() stepCompleted = new EventEmitter<FormGroup>();
  @Output() prevStep = new EventEmitter();
  stepForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.stepForm = this.fb.group({
      clientObs: [this.initialData ? this.initialData.clientObs : ''],
      schoolObs: [this.initialData ? this.initialData.schoolObs : ''],
    });
  }

  isFormValid() {
    return this.stepForm.valid;
  }

  handlePrevStep() {
    this.prevStep.emit();
  }

  completeStep() {
    if (this.isFormValid()) {
      this.stepCompleted.emit(this.stepForm);
    }
  }
}
