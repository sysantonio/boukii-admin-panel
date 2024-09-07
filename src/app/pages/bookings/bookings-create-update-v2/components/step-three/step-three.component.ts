import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import moment from "moment";
import { map, skip, startWith } from "rxjs";
import { ApiCrudService } from "src/service/crud.service";

@Component({
  selector: "booking-step-three",
  templateUrl: "./step-three.component.html",
  styleUrls: ["./step-three.component.scss"],
})
export class StepThreeComponent implements OnInit {
  @Input() initialData: any;
  @Input() utilizers: any;
  @Output() stepCompleted = new EventEmitter<FormGroup>();
  @Output() prevStep = new EventEmitter();
  stepForm: FormGroup;
  selectedSport;
  selectedLevel;
  sports: any;
  sportData: any;
  user: any;
  levels: any;
  filteredLevel: any;
  utilizersComplete: any[] = [];

  constructor(private fb: FormBuilder, private crudService: ApiCrudService) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("boukiiUser"));
    this.selectedSport = this.initialData.sport;
    this.selectedLevel = this.initialData.sportLevel;
    this.stepForm = this.fb.group({
      sport: [this.selectedSport || "", Validators.required],
      sportLevel: [this.selectedLevel || "", Validators.required],
    });

    this.getSports();
    this.getUtilizersData();

    this.stepForm.get("sport")!.valueChanges.subscribe((value) => {
      this.getDegrees(value.sport_id);
    });

    this.filteredLevel = this.stepForm.get("sportLevel").valueChanges.pipe(
      skip(1),
      map((value: any) =>
        typeof value === "string" ? value : value?.annotation
      ),
      map((annotation) =>
        annotation ? this._filterLevel(annotation) : this.levels.slice()
      )
    );
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

  getSports() {
    this.crudService
      .list(
        "/school-sports",
        1,
        10000,
        "asc",
        "id",
        "&school_id=" + this.user.schools[0].id
      )
      .subscribe((sport) => {
        this.sportData = sport.data;
        this.sportData.forEach((element) => {
          this.crudService
            .get("/sports/" + element.sport_id)
            .subscribe((data) => {
              element.name = data.data.name;
              element.icon = data.data.icon_selected;
              element.sport_type = data.data.sport_type;
            });
        });
      });
  }

  getUtilizersData() {
    this.utilizers.map((utilizer) => {
      this.crudService
        .get("/admin/clients/" + utilizer.id)
        .subscribe((data) => {
          this.utilizersComplete.push(data.data);
        });
    });
  }

  getDegrees(sportId: number) {
    this.crudService
      .list(
        "/degrees",
        1,
        10000,
        "asc",
        "degree_order",
        "&school_id=" +
          this.user.schools[0].id +
          "&sport_id=" +
          sportId +
          "&active=1"
      )
      .subscribe((data) => {
        this.levels = data.data;
        // vamos a utilizar solo al primer participantes para las comprobaciones, esto podria cambiar a hacer calculos entre todos los participantes
        const mainUtilizer = this.utilizersComplete[0];
        const age = mainUtilizer.birth_date
          ? this.calculateAge(mainUtilizer.birth_date)
          : 0;
        let foundSport = false;
        this.levels = this.levels.filter((level) => {
          return age >= level.age_min && age <= level.age_max;
        });
        mainUtilizer.client_sports.forEach((sport) => {
          if (
            sport.sport_id === this.stepForm.get("sport").value.sport_id &&
            sport.school_id === this.user.schools[0].id
          ) {
            const level = this.levels.find((l) => l.id === sport.degree_id);
            this.stepForm.get("sportLevel").patchValue(level);
            foundSport = true;
          }
        });
        if (!foundSport) {
          this.stepForm.get("sportLevel").patchValue(null);
        }
      });
  }

  displayFnLevel(level: any): string {
    return level && level?.name && level?.annotation
      ? level?.annotation + " " + level?.name
      : level?.name;
  }

  calculateAge(birthDateString) {
    const fechaActual = moment();
    const age = fechaActual.diff(
      moment(birthDateString, "YYYY-MM-DD"),
      "years"
    );
    return age;
  }

  private _filterLevel(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.levels.filter((level) =>
      level.annotation?.toLowerCase().includes(filterValue)
    );
  }
}
