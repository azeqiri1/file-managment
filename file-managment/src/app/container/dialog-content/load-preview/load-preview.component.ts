import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-load-preview',
  templateUrl: './load-preview.component.html',
  styleUrls: ['./load-preview.component.scss']
})
export class LoadPreviewComponent {
  isTextFile: boolean = false;
  isImageFile: boolean = false;
  isSafeResourceUrl: boolean = false;
  
  private _fileInfo: any;
  private _filePreview: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<LoadPreviewComponent>
  ) {
    this._fileInfo = data.fileInfo;
    this._filePreview = data.filePreview;

    if (this._filePreview && typeof this._filePreview === 'string') {
      this.isTextFile = this._fileInfo?.type.startsWith('text');
      this.isImageFile = this._fileInfo?.type.startsWith('image');
    } else {
      this.isSafeResourceUrl = true;
    }
  }

  get fileInfo() {
    return this._fileInfo;
  }

  get filePreview() {
    return this._filePreview;
  }

  get filePreviewSafeUrl() {
    return this._filePreview;
  }

  close() {
    this.dialogRef.close();
  }
}
