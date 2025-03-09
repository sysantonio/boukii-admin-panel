import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, } from '@angular/core';

@Component({
  selector: 'vex-flux-upload-img',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class FluxUploadImgComponent {
  @Input() imagePreviewUrl: any = ""
  @Input() Previus: boolean = true
  @Input() width: number = 400
  @Input() height: number = 290
  @Input() size: number = 1
  @Input() format: string = "PNG, JPG"
  @Output() upload = new EventEmitter();

  onFileChanged(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
        this.upload.emit(reader.result)
        reader.onload = null;
      };
      reader.readAsDataURL(file);
    }
  }
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  imageChangedEvent: any = null;
  archivo!: File;
  imageCropped(event: any) {
    this.archivo = new File([event.blob], event.objectUrl + ".webp", { type: "image/webp" });
  }
}
