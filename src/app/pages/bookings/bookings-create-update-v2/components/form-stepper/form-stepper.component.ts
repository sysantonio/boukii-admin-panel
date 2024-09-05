import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "booking-form-stepper",
  templateUrl: "./form-stepper.component.html",
  styleUrls: ["./form-stepper.component.scss"],
})
export class BookingFormStepper {
  stepperForm: FormGroup;
  currentStep = 0;

  constructor(private fb: FormBuilder) {
    // Inicializa el formulario vacío
    this.stepperForm = this.fb.group({
      step1: {},
      step2: {},
      step3: {},
    });
  }

  // Métodos para cambiar de paso
  nextStep() {
    if (this.currentStep < 2) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  // Manejar la finalización de cada paso
  handleStepCompletion(step: number, formGroup: FormGroup) {
    this.stepperForm.setControl(`step${step}`, formGroup);
    console.log(formGroup);
    this.nextStep();
  }

  submit() {
    if (this.stepperForm.valid) {
      console.log("Form Submitted:", this.stepperForm.value);
    } else {
      console.log("Form is invalid");
    }
  }
}
