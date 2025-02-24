import { Component, EventEmitter, Input, Output, } from '@angular/core';

@Component({
  selector: 'vex-flux-upload-img',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class FluxUploadImgComponent {
  @Output() upload: any = new EventEmitter<any>();
  @Input() imagePreviewUrl: any = ""
  @Input() Previus: boolean = true
  @Input() width: number = 400
  @Input() height: number = 290
  @Input() size: number = 1
  @Input() format: string = "PNG, JPG"

  onFileChanged(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
        this.upload.emit(reader.result)
      };
      reader.readAsDataURL(file);
    }
  }
}
