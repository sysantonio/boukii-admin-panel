import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, debounceTime, map, skip, startWith } from "rxjs";
import { ApiCrudService } from "src/service/crud.service";
import { ApiResponse } from "src/app/interface/api-response";
import {
  ClientCreateUpdateModalComponent
} from '../../../../clients/client-create-update-modal/client-create-update-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { UtilsService } from '../../../../../../service/utils.service';

@Component({
  selector: "booking-step-one",
  templateUrl: "./step-one.component.html",
  styleUrls: ["./step-one.component.scss"],
})
export class StepOneComponent implements OnInit {
  @Input() initialData: any;
  @Input() allLevels: any;
  @Output() stepCompleted = new EventEmitter<FormGroup>();

  stepOneForm: FormGroup;
  user: any;
  filteredOptions: Observable<any[]>;
  selectedClient: any;
  mainClient: any;
  expandClients: any[];
  userAvatar = "../../../../assets/img/avatar.png";

  constructor(private fb: FormBuilder, private crudService: ApiCrudService, protected utilsService: UtilsService,
    private dialog: MatDialog) { }

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

  setClient(ev) {
    this.selectedClient = ev.source.value;
    this.stepOneForm.patchValue({
      client: ev.source.value,
      mainClient: this.selectedClient.main_client || this.selectedClient,
    });
  }

  addClient() {

    const dialogRef = this.dialog.open(ClientCreateUpdateModalComponent, {
      width: '1000px', // Asegurarse de que no haya un ancho máximo
      height: '1000px', // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: { id: this.user.schools[0].id }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        this.crudService.list('/admin/clients/mains', 1, 10000, 'desc', 'id', '&school_id=' + this.user.schools[0].id + '&active=1')
          .subscribe((cl: any) => {
            const newClient = cl.data.find((c) => c.id = data.data.id);
            this.selectedClient = newClient;
            this.stepOneForm.patchValue({
              client: newClient,
              mainClient: this.selectedClient,
            });

          })

      }
    })
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
