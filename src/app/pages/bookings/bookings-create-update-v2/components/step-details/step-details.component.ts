import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MOCK_COURSE_PRIVATE } from "../../mocks/course";
import { MOCK_USER1, MOCK_USER2 } from "../../mocks/user";

@Component({
  selector: "booking-step-details",
  templateUrl: "./step-details.component.html",
  styleUrls: ["./step-details.component.scss"],
})
export class StepDetailsComponent {
  @Input() initialData: any;
  @Input() course: any;
  @Input() utilizers: any;
  @Output() stepCompleted = new EventEmitter<FormGroup>();
  @Output() prevStep = new EventEmitter();

  dates = [
    {
      date: "",
      hour: "",
      duration: "",
      monitor: "",
      monitorElection: "",
      //utilizers: this.utilizers,
      utilizers: [MOCK_USER1, MOCK_USER2],
    },
    {
      date: "",
      hour: "",
      duration: "",
      monitor: "",
      monitorElection: "",
      //utilizers: this.utilizers,
      utilizers: [MOCK_USER1, MOCK_USER2],
    },
  ];

  isFormValid() {
    return true;
    //return this.stepForm.valid;
  }

  handlePrevStep() {
    this.prevStep.emit();
  }

  completeStep() {
    if (this.isFormValid()) {
      //this.stepCompleted.emit(this.stepForm);
    }
  }

  constructor() {
    // ESTO se debera recibir del padre y trabajar con ello
    this.course = MOCK_COURSE_PRIVATE;
  }
}
