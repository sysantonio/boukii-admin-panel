import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import moment from "moment";
import { debounceTime, map, skip } from "rxjs";
import { ApiCrudService } from "src/service/crud.service";
import { UtilsService } from "src/service/utils.service";

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

  constructor(
    private fb: FormBuilder,
    private crudService: ApiCrudService,
    protected utilsService: UtilsService
  ) {}

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
      debounceTime(300),
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
        // TODO: Mejorar esto, debido al cambio de puntero de memoria cuando llego a este step y tengo initialData el radioButton no se selecciona
        if (this.selectedSport) {
          const newPointer = sport.data.find(
            (sp) => sp.id === this.selectedSport.id
          );
          this.stepForm.get("sport").patchValue(newPointer);
        }
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
        // almacenara los niveles de todos los utilizers para luego devolver el superior
        const posibleLevels = [];
        const biggestAge = this.utilizersComplete
          .map((utilizer) =>
            utilizer.birth_date
              ? this.utilsService.calculateYears(utilizer.birth_date)
              : 0
          )
          .sort((a, b) => b - a)[0];

        this.levels = this.levels.filter((level) => {
          return biggestAge >= level.age_min && biggestAge <= level.age_max;
        });
        this.utilizersComplete.forEach((utilizer) =>
          utilizer.client_sports.forEach((sport) => {
            if (
              sport.sport_id === this.stepForm.get("sport").value.sport_id &&
              sport.school_id === this.user.schools[0].id
            ) {
              const level = this.levels.find((l) => l.id === sport.degree_id);
              posibleLevels.push(level);
            }
          })
        );

        if (posibleLevels.length) {
          const correctLevel = posibleLevels
            .filter(Boolean)
            .sort((a, b) => b.degree_order - a.degree_order)[0];
          this.stepForm.get("sportLevel").patchValue(correctLevel);
        } else {
          this.stepForm.get("sportLevel").patchValue(null);
        }
      });
  }

  displayFnLevel(level: any): string {
    return level && level?.name && level?.annotation
      ? level?.annotation + " " + level?.name
      : level?.name;
  }
  private _filterLevel(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.levels.filter((level) =>
      level.annotation?.toLowerCase().includes(filterValue)
    );
  }
}
