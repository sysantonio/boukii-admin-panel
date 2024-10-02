import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'vex-course-componente-detalles',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class CourseComponenteDetallesComponent {
  @Input() courseFormGroup: UntypedFormGroup
  @Input() mode: "create" | "update"
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    defaultParagraphSeparator: '',
    defaultFontName: '',
    sanitize: false,
    toolbarPosition: 'bottom',
    outline: true,
    toolbarHiddenButtons: [['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'insertUnorderedList', 'insertOrderedList', 'heading']],
  }
  editor1Config: AngularEditorConfig = { ...this.editorConfig, height: '56px', }
  editor2Config: AngularEditorConfig = { ...this.editorConfig, height: '112px', }

}
