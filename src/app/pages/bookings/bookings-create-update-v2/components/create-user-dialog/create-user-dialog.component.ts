import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { debounceTime, map, Observable, startWith } from "rxjs";
import { ApiResponse } from "src/app/interface/api-response";
import { ApiCrudService } from "src/service/crud.service";
import { LangService } from "src/service/langService";

@Component({
  selector: "booking-create-user-dialog",
  templateUrl: "./create-user-dialog.component.html",
  styleUrls: ["./create-user-dialog.component.scss"],
})
export class CreateUserDialogComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private crudService: ApiCrudService,
    private langService: LangService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  user;
  expandClients: any[];
  stepForm: FormGroup;
  filteredOptions: Observable<any[]>;
  languages;

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("boukiiUser"));
    this.languages = this.langService.getLanguages();
    this.getClients().subscribe({
      next: (response) => {
        this.expandClients = this.getExpandClients(response.data);
      },
      error: (err) => {
        console.error("Error en la petición getClients", err);
      },
    });

    this.stepForm = this.fb.group({
      client: ["", Validators.required],
      name: ["", Validators.required],
      surname: ["", Validators.required],
      birthDate: ["", Validators.required],
      lenguages: ["", Validators.required],
    });

    this.filteredOptions = this.stepForm.get("client")!.valueChanges.pipe(
      startWith(""),
      debounceTime(300),
      map((value: any) =>
        typeof value === "string" ? value : this.displayFn(value)
      ),
      map((name) =>
        name ? this._filter(name) : this.expandClients?.slice(0, 50)
      )
    );
  }

  displayFn(client: any): string {
    return client && client?.first_name && client?.last_name
      ? client?.first_name + " " + client?.last_name
      : client?.first_name;
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

  setClient(ev) {
    this.stepForm.patchValue({
      client: ev.source.value,
    });
  }

  isFormValid() {
    return this.stepForm.valid;
  }

  handleConfirm() {
    console.log("confirmar");
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
