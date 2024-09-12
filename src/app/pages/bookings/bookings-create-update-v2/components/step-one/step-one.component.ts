import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, debounceTime, map, skip } from "rxjs";
import { ApiCrudService } from "src/service/crud.service";
import { ApiResponse } from "src/app/interface/api-response";

@Component({
  selector: "booking-step-one",
  templateUrl: "./step-one.component.html",
  styleUrls: ["./step-one.component.scss"],
})
export class StepOneComponent implements OnInit {
  @Input() initialData: any;
  @Output() stepCompleted = new EventEmitter<FormGroup>();

  stepOneForm: FormGroup;
  user: any;
  filteredOptions: Observable<any[]>;
  selectedClient: any;
  mainClient: any;
  expandClients: any[];

  constructor(private fb: FormBuilder, private crudService: ApiCrudService) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("boukiiUser"));
    this.selectedClient = this.initialData?.client;
    this.mainClient = this.initialData?.mainClient;
    this.getClients().subscribe({
      next: (response) => {
        this.expandClients = this.getExpandClients(response.data);
      },
      error: (err) => {
        console.error("Error en la petición getClients", err);
      },
    });

    this.stepOneForm = this.fb.group({
      client: [this.selectedClient || "", Validators.required],
      mainClient: [this.mainClient, Validators.required],
    });

    this.filteredOptions = this.stepOneForm.get("client")!.valueChanges.pipe(
      skip(1),
      debounceTime(300),
      map((value: any) =>
        typeof value === "string" ? value : this.displayFn(value)
      ),
      map((name) =>
        name ? this._filter(name) : this.expandClients.slice(0, 50)
      )
    );
  }

  setClient(ev) {
    this.selectedClient = ev.source.value;
    this.stepOneForm.patchValue({
      client: ev.source.value,
      mainClient: this.selectedClient.main_client || this.selectedClient,
    });
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
      this.stepCompleted.emit(this.stepOneForm);
    }
  }

  private getExpandClients(clients: any[]): any[] {
    let expandedClients = [];
    clients.forEach((client) => {
      expandedClients.push(client);
      client.utilizers?.forEach((utilizer) => {
        let expandedUtilizer = { ...utilizer, main_client: client };
        expandedClients.push(expandedUtilizer);
      });
    });
    return expandedClients;
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.expandClients.filter(
      (client) =>
        client.first_name.toLowerCase().includes(filterValue) ||
        client.last_name.toLowerCase().includes(filterValue)
    );
  }
}
