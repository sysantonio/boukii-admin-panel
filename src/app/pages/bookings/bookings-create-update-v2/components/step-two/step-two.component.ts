import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { ApiCrudService } from "src/service/crud.service";

import { MOCK_COUNTRIES } from "src/app/static-data/countries-data";

@Component({
  selector: "booking-step-two",
  templateUrl: "./step-two.component.html",
  styleUrls: ["./step-two.component.scss"],
})
export class StepTwoComponent implements OnInit {
  @Input() initialData: any;
  @Input() client: any;
  @Output() stepCompleted = new EventEmitter<FormGroup>();
  @Output() prevStep = new EventEmitter();
  stepForm: FormGroup;
  languages = [];
  countries = MOCK_COUNTRIES;
  selectedUtilizers;
  utilizers;
  userAvatar = "../../../../assets/img/booking-avatar.svg";

  constructor(private fb: FormBuilder, private crudService: ApiCrudService) {}

  ngOnInit(): void {
    this.utilizers = this.client.utilizers;
    this.selectedUtilizers = this.initialData.utilizers || [];
    this.stepForm = this.fb.group({
      utilizers: this.fb.array(this.selectedUtilizers, Validators.required),
    });

    this.getLanguages();
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

  getLanguages() {
    this.crudService.list("/languages", 1, 1000).subscribe((data) => {
      this.languages = data.data.reverse();
    });
  }

  getLanguage(id: any) {
    const lang = this.languages.find((c) => c.id == +id);
    return lang ? lang.code.toUpperCase() : "NDF";
  }

  calculateAge(birthDateString) {
    if (birthDateString && birthDateString !== null) {
      const today = new Date();
      const birthDate = new Date(birthDateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    } else {
      return 0;
    }
  }

  getCountry(id: any) {
    const country = this.countries.find((c) => c.id == id);
    return country ? country.name : "NDF";
  }

  // Manejar el cambio de los checkboxes
  onCheckboxChange(event: any) {
    const checkArray: FormArray = this.stepForm.get("utilizers") as FormArray;

    if (event.checked) {
      // Si el checkbox se selecciona, añadimos el valor al FormArray
      checkArray.push(this.fb.control(event.source.value));
    } else {
      // Si el checkbox se deselecciona, lo eliminamos del FormArray
      let index = checkArray.controls.findIndex(
        (x) => x.value === event.source.value
      );
      if (index !== -1) {
        checkArray.removeAt(index);
      }
    }
  }
}
