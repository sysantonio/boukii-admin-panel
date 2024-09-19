import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { MOCK_POSIBLE_EXTRAS } from "../../mocks/course";
import { UtilsService } from "src/service/utils.service";
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: "booking-form-details-colective-flex",
  templateUrl: "./form-details-colective-flex.component.html",
  styleUrls: ["./form-details-colective-flex.component.scss"],
})
export class FormDetailsColectiveFlexComponent implements OnInit {
  @Input() course: any;
  @Input() utilizer: any;
  @Input() sportLevel: any;
  @Input() initialData: any;
  @Output() stepCompleted = new EventEmitter<FormGroup>();
  @Output() prevStep = new EventEmitter();
  @Input() stepForm: FormGroup; // Recibe el formulario desde el padre

  posibleExtras;
  totalExtraPrice: number[] = [];


  constructor(protected utilsService: UtilsService, private fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.posibleExtras = this.course.course_extras;
    this.initializeForm();

    // Inicializa los precios a cero
    this.totalExtraPrice = new Array(this.course.course_dates.length).fill(0);
  }


  initializeForm() {
    // Obtener el FormArray existente
    const existingCourseDatesArray = this.stepForm.get('course_dates') as FormArray;

    // Si no existe el FormArray, lo inicializamos
    if (!existingCourseDatesArray) {
      const courseDatesArray = this.fb.array(
        this.course.course_dates.map((date, index) => {
          // Si hay datos iniciales, usamos esos datos para restaurar los valores seleccionados
          const initialSelected = this.initialData?.[index]?.selected || false;
          const initialExtras = this.initialData?.[index]?.extras || [];
          return this.createCourseDateGroup(date, initialSelected, initialExtras);
        }),
        this.atLeastOneSelectedValidator  // Validación personalizada
      );
      // Añadir el FormArray al formulario del padre
      this.stepForm.addControl('course_dates', courseDatesArray);
    }
  }


  // Validación personalizada para asegurarse de que al menos una fecha esté seleccionada
  atLeastOneSelectedValidator(formArray: FormArray): { [key: string]: boolean } | null {
    const selectedDates = formArray.controls.some(control => control.get('selected')?.value);
    return selectedDates ? null : { noDatesSelected: true };
  }

  createCourseDateGroup(courseDate: any, selected: boolean = false, extras: any[] = []): FormGroup {
    const monitor = this.findMonitor(courseDate);
    return this.fb.group({
      selected: [selected],
      date: [courseDate.date],
      startHour: [courseDate.hour_start],
      endHour: [courseDate.hour_end],
      price: this.course.price,
      currency: this.course.currency,
      extras: [{ value: extras, disabled: !selected || !this.posibleExtras || !this.posibleExtras.length }] ,
      monitor: [monitor]
    });
  }

  findMonitor(courseDate: any): any {
    // Filtra los grupos que coinciden con el `degree_id` de this.sportLevel
    const matchingGroup = courseDate.course_groups.find(group => group.degree_id === this.sportLevel.id);

    if (matchingGroup) {
      // Busca el subgrupo que tiene menos participantes que el máximo permitido
      const availableSubgroup = matchingGroup.course_subgroups.find(subgroup =>
        subgroup.booking_users.length < subgroup.max_participants
      );

      // Retorna el monitor si lo encuentra
      return availableSubgroup?.monitor || null;
    }

    // Si no encuentra ningún grupo o subgrupo adecuado, retorna null
    return null;
  }

  onDateSelect(event: any, index: number) {
    const isChecked = event.checked;
    const courseDateGroup = this.courseDatesArray.at(index) as FormGroup;
    const extrasControl = courseDateGroup.get('extras');

    if (isChecked) {
      extrasControl.enable();
    } else {
      extrasControl.disable();
      extrasControl.setValue([]);
    }
  }

  // Calcula el total de extras seleccionados para una fecha específica
  onExtraChange(index: number) {
    const selectedExtras = this.courseDatesArray.at(index).get('extras').value || [];
    this.totalExtraPrice[index] = selectedExtras.reduce((acc, extra) => acc*1 + extra.price*1, 0);
  }

  get courseDatesArray(): FormArray {
    return this.stepForm.get('course_dates') as FormArray;
  }

  isSelected(index: number): boolean {
    return (this.courseDatesArray.at(index) as FormGroup).get('selected').value;
  }

  formatDate(date: string) {
    return this.utilsService.formatDate(date);
  }

}
