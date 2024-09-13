import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'upload-img',
  templateUrl: './upload-img.component.html',
  styleUrls: ['./upload-img.component.scss']
})
export class UploadImgComponent {
  @Output() upload: any = new EventEmitter<any>();

  imagePreviewUrl: any
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