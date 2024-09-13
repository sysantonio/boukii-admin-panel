import { Component, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ApiCrudService } from "src/service/crud.service";
import { LangService } from "src/service/langService";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "vex-create-client-dialog",
  templateUrl: "./create-client-dialog.component.html",
  styleUrls: ["./create-client-dialog.component.scss"],
})
export class CreateClientDialogComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private langService: LangService,
    private crudService: ApiCrudService,
    private dialogRef: MatDialogRef<CreateClientDialogComponent>
  ) {}

  step = signal(0);
  stepForm: FormGroup;
  languages;
  user;
  sports;

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("boukiiUser"));
    this.languages = this.langService.getLanguages();
    this.getSports();
    this.stepForm = this.fb.group({
      step1: this.fb.group({
        name: ["", Validators.required],
        surname: ["", Validators.required],
        email: ["", [Validators.email, Validators.required]],
        userName: [""],
        image: ["", Validators.required],
      }),
      step2: this.fb.group({
        birthDate: ["", Validators.required],
        phone: ["", Validators.required],
        phone2: [""],
        address: [""],
        country: [""],
        province: [""],
        postalCode: [""],
        languages: ["", Validators.required],
      }),
      step3: this.fb.group({
        sports: [""],
        general: [""],
        obeservation: [""],
        historical: [""],
      }),
    });
  }

  setStep(index: number) {
    this.step.set(index);
  }

  nextStep() {
    this.step.update((i) => i + 1);
  }

  prevStep() {
    this.step.update((i) => i - 1);
  }

  isFormStep1Valid() {
    return this.stepForm.get("step1")!.valid;
  }

  isFormStep2Valid() {
    return this.stepForm.get("step2")!.valid;
  }

  isFormValid() {
    return this.stepForm.valid;
  }

  handleImageUpload(ev) {
    this.stepForm.get("step1")!.patchValue({
      image: ev,
    });
  }

  completeForm() {
    // TODO: crear usuario con la info recibida
    this.dialogRef.close();
  }

  getSports() {
    this.crudService
      .list(
        "/school-sports",
        1,
        10000,
        "asc",
        "id",
        "&school_id=" + this.user.schools[0].id,
        null,
        null,
        null,
        ["sport"]
      )
      .subscribe((schoolSports) => {
        this.sports = schoolSports.data;
      });
  }
}
