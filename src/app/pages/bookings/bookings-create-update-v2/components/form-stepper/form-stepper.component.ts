import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "booking-form-stepper",
  templateUrl: "./form-stepper.component.html",
  styleUrls: ["./form-stepper.component.scss"],
})
export class BookingFormStepper implements OnChanges {
  @Output() changedCurrentStep = new EventEmitter<number>();
  @Output() changedFormData = new EventEmitter();
  @Input() forceStep: number;
  stepperForm: FormGroup;
  currentStep = 0;
  STEPS_LENGTH = 4;

  constructor(private fb: FormBuilder) {
    // Inicializa el formulario vacío
    this.stepperForm = this.fb.group({
      step1: {},
      step2: {},
      step3: {},
      step4: {},
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes["forceStep"] &&
      changes["forceStep"].currentValue !== undefined
    ) {
      const newStep = changes["forceStep"].currentValue;
      this.currentStep = newStep;
      this.changedCurrentStep.emit(newStep);
    }
  }

  // Métodos para cambiar de paso
  nextStep() {
    if (this.currentStep < this.STEPS_LENGTH - 1) {
      this.currentStep++;
    }
    this.changedCurrentStep.emit(this.currentStep);
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
    this.changedCurrentStep.emit(this.currentStep);
  }

  // Manejar la finalización de cada paso
  handleStepCompletion(step: number, formGroup: FormGroup) {
    this.stepperForm.setControl(`step${step}`, formGroup);
    if (step < this.STEPS_LENGTH) {
      for (let i = step + 1; i <= this.STEPS_LENGTH; i++) {
        this.stepperForm.setControl(`step${i}`, this.fb.group({}));
      }
    }

    this.nextStep();
    this.changedFormData.emit(this.stepperForm);
  }
}
