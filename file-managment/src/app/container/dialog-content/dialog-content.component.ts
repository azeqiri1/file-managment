import { Component, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MockApiService } from 'src/app/services/mock-api.service';
import { LoadPreviewComponent } from './load-preview/load-preview.component';

@Component({
  selector: 'app-dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.scss'],
})
export class DialogContentComponent {
  @ViewChild('fileInput') fileInput: any;
  selectedFolder: any;
  fileInfo: any = null;
  filePreview: string | ArrayBuffer | SafeResourceUrl | null = null;
  listFolders: any = [];
dataToPassFromDialog
  userId: any = JSON.parse(localStorage.getItem('currentUser'));

  constructor(
    private dialogRef: MatDialogRef<DialogContentComponent>,
    private dialog: MatDialog,
    private folderService: MockApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.getFolders();
  }

  getFolders() {
    this.folderService.getFoldersByUserId(this.userId.id).subscribe(
      (data) => {
        this.listFolders = data;
        console.log(this.listFolders);
      },
      (error) => {
        console.error('Error fetching folders:', error);
      }
    );
  }

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

      this.filePreview = null; // Reset preview

      reader.onload = () => {
        this.filePreview = reader.result;
        this.openPreviewDialog();
      };

      if (file.type.startsWith('image')) {
        reader.readAsDataURL(file);
      } else if (
        file.type === 'text/plain' ||
        file.type === 'application/json' ||
        file.type === 'text/csv'
      ) {
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        this.filePreview = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(file)
        );
        this.openPreviewDialog();
      }
    }
  }
  openPreviewDialog(): void {
    const dialogRef = this.dialog.open(LoadPreviewComponent, {
      data: {
        fileInfo: this.fileInfo,
        filePreview: this.filePreview,
      },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result, 'rezi');
        this.fileInfo = result.fileInfo;
        this.filePreview = result.filePreview;
        this.dataToPassFromDialog = result;
        this.uploadFile();  // Call upload file after the dialog is closed
      }
    });
  }
  
  uploadFile(): void {
    if (this.fileInfo && this.filePreview) {
      const formData = new FormData();
  
      // Append the file object directly (not the file info)
      const fileToUpload = this.fileInput.nativeElement.files[0];
      formData.append('file', fileToUpload); // Append the actual file
      formData.append('content', JSON.stringify(this.dataToPassFromDialog));  // Convert object to string
      formData.append('uploadedAt', new Date().toISOString());  // Add timestamp
  
      // Log the form data to see its content
      formData.forEach((value, key) => {
        console.log(key, value, 'rozi');  // Check the contents of the formData object
      });
  
      // Pass back the necessary data after closing the dialog
      this.dialogRef.close({ formData: formData, fileInfo: this.fileInfo, filePreview: this.filePreview });
    } else {
      console.error('Please select a folder and upload a file.');
    }
  }
  
  add(){}

  close() {
    this.dialogRef.close();
  }
}
