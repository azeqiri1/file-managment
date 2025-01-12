import { Component, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MockApiService } from 'src/app/services/mock-api.service';

@Component({
  selector: 'app-menus-dialog-component',
  templateUrl: './menus-dialog-component.component.html',
  styleUrls: ['./menus-dialog-component.component.scss']
})
export class MenusDialogComponentComponent {
  selectedFolder: any;
  fileInfo: any = null;
  filePreview: string | ArrayBuffer | SafeResourceUrl | null = null;
  listFolders: any = [];
  userId: any = JSON.parse(localStorage.getItem('currentUser'));
constructor(
  private dialogRef: MatDialogRef<MenusDialogComponentComponent>,
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


add(){
  this.dialogRef.close(this.selectedFolder); 
}

close() {
  this.dialogRef.close();
}
}
