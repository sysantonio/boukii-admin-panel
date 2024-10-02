import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'vex-course-componente-idiomas',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class CourseComponenteIdiomasComponent {
  @Input() courseFormGroup: UntypedFormGroup
  @Input() mode: "create" | "update"
  Translate: { Code: string, Name: string }[] = [
    { Code: "es", Name: "ESPAÑOL" },
    { Code: "en", Name: "INGLES" },
    { Code: "fr", Name: "FRANCÉS" },
    { Code: "de", Name: "ALEMAN" },
    { Code: "it", Name: "ITALIANO" },
  ]
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    //height: '56px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    defaultParagraphSeparator: '',
    defaultFontName: '',
    sanitize: false,  // Esta línea es clave para permitir HTML sin sanitizarlo.
    toolbarPosition: 'bottom',
    outline: true,
    toolbarHiddenButtons: [['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'insertUnorderedList', 'insertOrderedList', 'heading']],
  }
  editor1Config: AngularEditorConfig = { ...this.editorConfig, height: '56px', }
  editor2Config: AngularEditorConfig = { ...this.editorConfig, height: '112px', }


}
