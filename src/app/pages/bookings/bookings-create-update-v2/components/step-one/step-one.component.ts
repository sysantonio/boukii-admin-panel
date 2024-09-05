import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, debounceTime, map, skip, startWith } from "rxjs";
import { ApiCrudService } from "src/service/crud.service";
import { ApiResponse } from "src/app/interface/api-response";

@Component({
  selector: "booking-step-one",
  templateUrl: "./step-one.component.html",
  styleUrls: ["./step-one.component.scss"],
})
export class StepOneComponent implements OnInit {
  @Input() initialData: any; // Recibe datos iniciales
  @Output() stepOneCompleted = new EventEmitter<FormGroup>();

  stepOneForm: FormGroup;
  user: any;
  filteredOptions: Observable<any[]>;
  $clients: any;
  selectedClient: any;

  constructor(private fb: FormBuilder, private crudService: ApiCrudService) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("boukiiUser"));
    this.selectedClient = this.initialData?.client;
    this.getClients().subscribe({
      next: (response) => {
        this.$clients = response.data;
      },
      error: (err) => {
        console.error("Error en la petición getClients", err);
      },
    });

    this.stepOneForm = this.fb.group({
      client: [this.selectedClient || "", Validators.required],
    });

    this.filteredOptions = this.stepOneForm.get("client")!.valueChanges.pipe(
      skip(1),
      debounceTime(300),
      map((value: any) =>
        typeof value === "string" ? value : this.displayFn(value)
      ),
      map((name) =>
        name
          ? this._filter(name)
          : this.expandClients(this.$clients).slice(0, 50)
      )
    );
  }

  setClient(ev) {
    this.selectedClient = ev.source.value;
  }

  displayFn(client: any): string {
    return client && client?.first_name && client?.last_name
      ? client?.first_name + " " + client?.last_name
      : client?.first_name;
  }

  isFormValid() {
    return (
      this.stepOneForm.valid &&
      this.selectedClient === this.stepOneForm.get("client").value
    );
  }

  getClients(): Observable<ApiResponse> {
    return this.crudService.list(
      "/admin/clients/mains",
      1,
      10000,
      "desc",
      "id",
      "&school_id=" + this.user.schools[0].id + "&active=1"
    );
  }

  completeStep() {
    if (this.isFormValid()) {
      this.stepOneCompleted.emit(this.stepOneForm);
    }
  }

  private expandClients(clients: any[]): any[] {
    let expandedClients = [];
    clients.forEach((client) => {
      expandedClients.push(client);
      if (client.utilizers && client.utilizers.length > 0) {
        client.utilizers.forEach((utilizer) => {
          let expandedUtilizer = { ...utilizer, main_client: client };
          expandedClients.push(expandedUtilizer);
        });
      }
    });
    return expandedClients;
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.expandClients(this.$clients).filter(
      (client) =>
        client.first_name.toLowerCase().includes(filterValue) ||
        client.last_name.toLowerCase().includes(filterValue)
    );
  }
}
