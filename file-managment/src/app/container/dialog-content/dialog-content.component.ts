import { Component, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoadPreviewComponent } from './load-preview/load-preview.component';
LoadPreviewComponent

@Component({
  selector: 'app-dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.scss'],
})
export class DialogContentComponent {
  @ViewChild('fileInput') fileInput: any; // Reference to the file input
  constructor(
    private dialogRef: MatDialogRef<DialogContentComponent>,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  selectedFolder: any;
  fileInfo: any = null;
  // Update filePreview type to handle SafeResourceUrl as well
  filePreview: string | ArrayBuffer | SafeResourceUrl | null = null; 
  listFolders: any = [];

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.fileInfo = {
        name: file.name,
        type: file.type,
        size: file.size,
      };
      const reader = new FileReader();

      this.filePreview = null;  // Reset preview

      reader.onload = () => {
        this.filePreview = reader.result;
        this.openPreviewDialog(); 
      };

      if (file.type.startsWith('image')) {
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain' || file.type === 'application/json' || file.type === 'text/csv') {
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        // Use DomSanitizer to create a safe URL for PDF files
        this.filePreview = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
        this.openPreviewDialog();
      } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.filePreview = 'Preview- ja eshte e pa- aplikueshme per kete dokument!';
        this.openPreviewDialog();
      } else if (file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        this.filePreview = 'Preview- ja eshte e pa- aplikueshme per kete dokument!';
        this.openPreviewDialog();
      } else if (file.type === 'application/zip') {
        this.filePreview = 'Preview- ja eshte e pa- aplikueshme per kete dokument!';
        this.openPreviewDialog();
      } else {
        this.filePreview = 'Preview- ja eshte e pa- aplikueshme per kete dokument!';
        this.openPreviewDialog(); 
      }
    }
  }

  openPreviewDialog(): void {
    const dialogRef = this.dialog.open(LoadPreviewComponent, {
      data: {
        fileInfo: this.fileInfo,
        filePreview: this.filePreview,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Preview dialog closed');
    });
  }

  close() {
    this.dialogRef.close();
  }

  add() {}
}
