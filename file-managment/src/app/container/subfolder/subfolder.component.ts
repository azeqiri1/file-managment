import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';
import { MockApiService } from 'src/app/services/mock-api.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { EditComponent } from '../dashboard/edit/edit.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-subfolder',
  templateUrl: './subfolder.component.html',
  styleUrls: ['./subfolder.component.scss'],
})
export class SubfolderComponent implements OnInit {
  folderId: string | null = null;
  subfolderId: string | null = null;
  parentFolder: any;
  files: any[] = [];
  searchQuery: string = ''; // Search query for filtering folders and subfolders
  isGridView = true;
  userId: any = JSON.parse(localStorage.getItem('currentUser')); // Get current user from localStorage
  folders: any;
  showDeleteButton: any;
  filterFiles: any[];
  subfolders: any;
  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private mockService: MockApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['subfolder']) {
        const subfolderString = params['subfolder'];
        this.parentFolder = JSON.parse(subfolderString); // Now it's the actual object
        this.getSubfolders();
      }
    });
  }

  onSearchChange() {
    const query = this.searchQuery.toLowerCase();
    this.filterFiles = this.files.filter(
      (file) =>
        file.name.toLowerCase().includes(query) ||
        file.uploadedAt.toLowerCase().includes(query)
    );
  }

  changeGrid(): void {
    this.isGridView = !this.isGridView; // Toggle between grid and list view
  }

  openMenu(event: MouseEvent, element, viewChild: MatMenuTrigger) {
    event.preventDefault();
    viewChild.openMenu();
  }

  getSubfolders() {
    this.mockService.getFiles(this.parentFolder).subscribe(
      (subfolders) => {
        this.subfolders = subfolders[0];
        this.files = subfolders[0].files;
        // Optional: Do something with the files array
        if (this.files.length > 0) {
          this.filterFiles = [...this.files]; // Initialize filteredSubfolders
          this.filterFiles.sort((a, b) => a.position - b.position); // Sort subfolders
        } else {
          console.log('No files found');
        }
      },
      (error) => {
        console.error('Error loading subfolders:', error);
      }
    );
  }

  openPreview(fileObject: any): void {
    const previewWindow = window.open('', '_blank');
  
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>File Preview - ${fileObject.name}</title>
          </head>
          <body style="text-align: center; padding: 20px;">
            <h1>Preview of ${fileObject.name}</h1>
      `);
  
      // Check if preview is a string (base64 or blob URL) or a Blob object
      if (typeof fileObject.preview === 'string') {
        if (fileObject.type === 'application/pdf') {
          // Handle PDFs
          if (fileObject.preview.startsWith('blob:')) {
            // If it's already a blob URL, use it directly
            previewWindow.document.write(`
              <object data="${fileObject.preview}" type="application/pdf" width="100%" height="100%">
                <p>Unable to display PDF. Please download the file <a href="${fileObject.preview}" target="_blank">here</a>.</p>
              </object>
            `);
          } else {
            // If it's a base64 string, convert to a blob and create a blob URL
            const byteCharacters = atob(fileObject.preview.split(',')[1]); // Decode base64
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
              const slice = byteCharacters.slice(offset, offset + 1024);
              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }
              byteArrays.push(new Uint8Array(byteNumbers));
            }
            const byteArray = new Blob(byteArrays, { type: 'application/pdf' });
            const objectURL = URL.createObjectURL(byteArray);
  
            previewWindow.document.write(`
              <object data="${objectURL}" type="application/pdf" width="100%" height="100%">
                <p>Unable to display PDF. Please download the file <a href="${objectURL}" target="_blank">here</a>.</p>
              </object>
            `);
          }
        } else if (fileObject.type.startsWith('image/')) {
          // Handle images
          if (fileObject.preview.startsWith('blob:')) {
            // If it's already a blob URL, use it directly
            previewWindow.document.write(`
              <img src="${fileObject.preview}" alt="File Preview" style="max-width: 100%; height: auto;" />
            `);
          } else {
            // If it's a base64 string, convert to a blob and create a blob URL
            const byteCharacters = atob(fileObject.preview.split(',')[1]); // Decode base64
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
              const slice = byteCharacters.slice(offset, offset + 1024);
              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }
              byteArrays.push(new Uint8Array(byteNumbers));
            }
            const byteArray = new Blob(byteArrays, { type: fileObject.type });
            const objectURL = URL.createObjectURL(byteArray);
  
            previewWindow.document.write(`
              <img src="${objectURL}" alt="File Preview" style="max-width: 100%; height: auto;" />
            `);
          }
        } else {
          previewWindow.document.write(`
            <p>Unsupported file type.</p>
          `);
        }
      } else if (fileObject.preview instanceof Blob) {
        // If preview is a Blob (e.g. a file object), create a URL for it
        const objectURL = URL.createObjectURL(fileObject.preview);
        
        if (fileObject.type === 'application/pdf') {
          previewWindow.document.write(`
            <object data="${objectURL}" type="application/pdf" width="100%" height="100%">
              <p>Unable to display PDF. Please download the file <a href="${objectURL}" target="_blank">here</a>.</p>
            </object>
          `);
        } else if (fileObject.type.startsWith('image/')) {
          previewWindow.document.write(`
            <img src="${objectURL}" alt="File Preview" style="max-width: 100%; height: auto;" />
          `);
        } else {
          previewWindow.document.write(`
            <p>Unsupported file type.</p>
          `);
        }
      } else {
        previewWindow.document.write(`
          <p>Ndodhi nje gabim</p>
        `);
      }
  
      previewWindow.document.write(`
          </body>
        </html>
      `);
      previewWindow.document.close();
    } else {
      console.error('Failed to open a new window.');
    }
  }
  
  
  
  

  onItemCheckboxChange(item: any) {
    if (!!item) {
      this.showDeleteButton = true;
    }
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    const previousIndex = this.files.findIndex((d) => d === event.item.data);
    const currentIndex = event.currentIndex;

    if (previousIndex !== currentIndex) {
      moveItemInArray(this.files, previousIndex, currentIndex);
      this.files.forEach((subfolder, index) => {
        subfolder.position = index;
      });
    }
  }

  addDocument() {
    const dialogRef = this.dialog.open(DialogContentComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.addFileToSubfolder(result);
      this.getSubfolders();
    });
  }

  addFileToSubfolder(newFile: any) {
    let parentFolder = this.subfolders;
    let files = parentFolder.files;
    if (files) {
      const newFileObject = {
        id: new Date().getTime(),
        name: newFile.fileInfo.name,
        size: newFile.fileInfo.size, // File size from the dialog result
        type: newFile.fileInfo.type, // File type from the dialog result
        uploadedAt: new Date().toISOString(), // Timestamp when file is uploaded
        preview: newFile.filePreview, // File preview from the dialog result
        parentId: parentFolder.id, // Parent folder ID
      };
      // Add the new file object to the subfolder's files array
      files.push(newFileObject);

      // Now call the mock service to update the subfolder with the new file
      this.mockService.updateSubfolder(parentFolder).subscribe(
        (response) => {
          console.log('Subfolder updated successfully:', response);
        },
        (error) => {
          console.error('Error updating subfolder:', error);
        }
      );
    }
  }

  // deleteMultipleFilesFromSubfolder(selectedFileIds: number[]) {
  //   let parentFolder:this.parentFolder,
  //   let selectedFileIds
  //   const files = parentFolder.files;

  //   // Filter out the files with the selected IDs
  //   const remainingFiles = files.filter(file => !selectedFileIds.includes(file.id));

  //   if (remainingFiles.length !== files.length) {
  //     // Update the subfolder by calling the mock API with the new filtered files list
  //     parentFolder.files = remainingFiles;

  //     this.mockService.updateSubfolder(parentFolder).subscribe(
  //       (response) => {
  //         console.log('Multiple files deleted successfully:', response);
  //       },
  //       (error) => {
  //         console.error('Error deleting multiple files:', error);
  //       }
  //     );
  //   } else {
  //     console.log('No files selected or all selected files are already deleted');
  //   }
  // }

  deleteFileFromSubfolder(fileId) {
    let parentFolder = this.subfolders;
    const files = parentFolder.files;

    // Find the index of the file to delete
    const fileIndex = files.findIndex((file) => file.id === fileId);

    if (fileIndex !== -1) {
      // Remove the file from the array
      files.splice(fileIndex, 1);

      // Update the subfolder by calling the mock API
      this.mockService.updateSubfolder(parentFolder).subscribe(
        (response) => {
          this.getSubfolders();
          console.log('File deleted successfully:', response);
        },
        (error) => {
          console.error('Error deleting file:', error);
        }
      );
    } else {
      console.log('File not found');
    }
  }
}
