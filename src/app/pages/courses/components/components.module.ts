import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatDividerModule } from '@angular/material/divider';
import { CourseComponenteDetallesComponent } from "./flux1-detalles/app.component";
import { FluxUploadImgModule } from "src/@vex/components/flux-component/upload-img/app.module";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { CourseComponenteFechasComponent } from "./flux2-fechas/app.component";
import { CourseComponenteNivelesComponent } from "./flux3-niveles/app.component";
import { MatTableModule } from "@angular/material/table";
import { FluxDisponibilidadModule } from "src/@vex/components/flux-component/flux-disponibilidad/app.module";
import { CourseComponenteExtrasComponent } from "./flux4-extras/app.component";
import { FluxModalModule } from "src/@vex/components/flux-component/flux-modal/app.module";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { CourseComponenteIdiomasComponent } from "./flux5-idiomas/app.component";
import { MatExpansionModule } from "@angular/material/expansion";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    TranslateModule,
    MatDialogModule,
    MatDatepickerModule,
    MatSelectModule,
    MatTabsModule,
    MatDividerModule,
    FluxUploadImgModule,
    AngularEditorModule,
    MatTableModule,
    FluxDisponibilidadModule,
    FluxModalModule,
    MatSlideToggleModule,
    MatExpansionModule
  ],
  declarations: [
    CourseComponenteDetallesComponent,
    CourseComponenteFechasComponent,
    CourseComponenteNivelesComponent,
    CourseComponenteExtrasComponent,
    CourseComponenteIdiomasComponent
  ],
  exports: [
    CourseComponenteDetallesComponent,
    CourseComponenteFechasComponent,
    CourseComponenteNivelesComponent,
    CourseComponenteExtrasComponent,
    CourseComponenteIdiomasComponent
  ]
})
export class CourseComponentsModule { }
