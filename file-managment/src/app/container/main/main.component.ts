import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MockApiService } from 'src/app/services/mock-api.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { EditComponent } from '../dashboard/edit/edit.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MenusDialogComponentComponent } from '../dashboard/menus-dialog-component/menus-dialog-component.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  folderId: string | null = null;
  subfolders: any[] = [];
  searchQuery: string = ''; // Search query for filtering folders and subfolders
  isGridView = true;
  userId: any = JSON.parse(localStorage.getItem('currentUser')); // Get current user from localStorage
  folders: any;
  showDeleteButton: any;
  filteredSubfolders: any[];

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private mockService: MockApiService
  ) {
    this.route.queryParams.subscribe((params) => {
      const newFolderId = params['folderId'];
      if (this.folderId !== newFolderId) {
        this.folderId = newFolderId;
        this.loadSubfolders(this.folderId);
        this.filteredSubfolders = [...this.subfolders]; // Initialize filteredSubfolders
      }
    });
  }

  loadSubfolders(folderId) {
    this.mockService.getSubfoldersByFolderId(folderId).subscribe(
      (subfolders) => {
        this.subfolders = subfolders;
        this.filteredSubfolders = [...this.subfolders]; // Initialize filtered subfolders
        this.filteredSubfolders.sort((a, b) => a.position - b.position); // Sort subfolders
      },
      (error) => {
        console.error('Error loading subfolders:', error);
      }
    );
  }

  // Method to filter subfolders based on search query
  onSearchChange() {
    const query = this.searchQuery.toLowerCase();
    this.filteredSubfolders = this.subfolders.filter(subfolder => 
      subfolder.name.toLowerCase().includes(query) ||
      subfolder.createdBy.toLowerCase().includes(query) ||
      subfolder.uploadedAt.toLowerCase().includes(query)
    );
  }

  changeGrid(): void {
    this.isGridView = !this.isGridView; // Toggle between grid and list view
  }

  goToSubfolder(subfolder) {
    console.log(subfolder,'dimero')
    this.router.navigate([`/dashboard/folder/${this.folderId}/subfolder/${subfolder.id}`], {
      queryParams: {
        subfolder: subfolder.id, // Serialize the object to a string
      },
    });
  }

  openMenu(event: MouseEvent, element, viewChild: MatMenuTrigger) {
    event.preventDefault();
    viewChild.openMenu();
  }

  saveNodeSubfolder(node): void {
    console.log(node)
    const dialogRef = this.dialog.open(EditComponent, {
      data: {
        docId: node.id,
        docName: node.name,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedFolder = { name: result };
        this.mockService.updateSubfolderName(node.id, updatedFolder).subscribe(() => {
          this.loadSubfolders(this.folderId);
        });
      }
    });
  }

  onItemCheckboxChange(item: any) {
    if (!!item) {
      this.showDeleteButton = true;
    }
  }

  changeParent() {
    const dialogRef = this.dialog.open(MenusDialogComponentComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.updateParentId(result);
      this.loadSubfolders(this.folderId)
    });
  }

  updateParentId(newParentId: number) {
    // Collect IDs of selected items
    const selectedIds = this.subfolders.filter(item => item.checked).map(item => item.id);

    if (selectedIds.length > 0) {
      this.mockService.updateParentId(selectedIds, newParentId).subscribe(
        response => {
          console.log('Parent IDs updated successfully:', response);
          // Update the list with new parentId values
          this.subfolders.forEach(item => {
            if (item.checked) {
              item.parentId = newParentId;  // Update the parentId for selected items
            }
          });
          this.showDeleteButton = false; 
           // Hide the update button after updating
        },
        error => {
          console.error('Error updating parentIds:', error);
        }
      );
    } else {
      console.log('No items selected');
    }
  }


  deleteMultiple() {
    // Collect IDs of selected items
    const selectedIds = this.subfolders.filter(item => item.checked).map(item => item.id);

    // Call the service to delete the selected items
    if (selectedIds.length > 0) {
      this.mockService.deleteMultiple(selectedIds).subscribe(
        response => {
          console.log('Items deleted successfully:', response);
          // Update the list by removing deleted items
          this.subfolders = this.subfolders.filter(item => !item.checked);
          this.loadSubfolders(this.folderId)
          this.showDeleteButton = false;  // Hide the delete button after deletion
        },
        error => {
          console.error('Error deleting items:', error);
        }
      );
    } else {
      console.log('No items selected');
    }
  }
  

  onDrop(event: CdkDragDrop<any[]>): void {
    const previousIndex = this.subfolders.findIndex((d) => d === event.item.data);
    const currentIndex = event.currentIndex;

    if (previousIndex !== currentIndex) {
      moveItemInArray(this.subfolders, previousIndex, currentIndex);
      this.subfolders.forEach((subfolder, index) => {
        subfolder.position = index;
      });
    }
  }

  addSubfolder() {
    let id: any;
    const newSubfolder = {
      id: id, // New unique ID for the subfolder
      parentId: this.folderId,
      name: `Nen-Dosje e re`,
      position: this.subfolders.length + 1,
      createdBy: this.userId.username,
      uploadedAt: new Date().toISOString(),
      files: [],
    };

    this.mockService.addSubfolder(newSubfolder).subscribe(() => {
      this.loadSubfolders(this.folderId);
    });
  }

  deleteElement(node) {
    this.mockService.deleteSubfolder(node.id).subscribe();
    this.loadSubfolders(this.folderId);
  }

  addDocument() {
    const dialogRef = this.dialog.open(DialogContentComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }
}
