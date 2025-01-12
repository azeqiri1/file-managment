import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlattener,
  MatTreeFlatDataSource,
} from '@angular/material/tree';
import { CdkDragDrop, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';

import { MockApiService } from 'src/app/services/mock-api.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditComponent } from './edit/edit.component';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private _transformer = (node , level: number) => {
    return {
      id:node.id,
      parentId:node.parentId,
      expandable: level === 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<any>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.subfolders
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  user: any;
  userName: any;
  isDarkTheme: boolean = false;
  isEditing: boolean = false;
  listFolders: any;
  currentPath: string[] = [];
  isOpened = false;
  userId: any = JSON.parse(localStorage.getItem('currentUser'));
  selectedFolders = [];
  isPanelExpanded = false;
  searchQuery: string = '';
  subfolder:any;
  dataToPass: any;
  filteredFolders: any[] = [];

  @Input() theme: string = 'light';

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private mockService: MockApiService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getFolders();
    this.setupTheme();
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    } else {
      this.isDarkTheme = false;
      document.body.classList.remove('dark-theme');
    }

    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.userName = this.user.username;
    this.theme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', this.theme);
  }

  // Get folders from mock service (replace with your real API call)
  getFolders() {
    this.mockService.getFoldersByUserId(this.userId.id).subscribe(
      (data) => {
        this.listFolders = data;
        this.filteredFolders = [...this.listFolders]; // Initialize filteredFolders
        this.dataSource.data = this.filteredFolders;
      },
      (error) => {
        console.error('Error fetching folders:', error);
      }
    );
  }

  filterFolders() {
    if (!this.searchQuery.trim()) {
      // If search is empty, show all folders
      this.filteredFolders = [...this.listFolders];
    } else {
      // Filter folders and subfolders by search query
      this.filteredFolders = this.listFolders
        .map((folder) =>
          this.filterNode(folder, this.searchQuery.toLowerCase())
        )
        .filter((folder) => folder !== null); // Remove folders with no match
    }

    // Update the tree data source with the filtered folders
    this.dataSource.data = this.filteredFolders;
  }

  // Recursive function to check if a folder or its subfolders match the search query
  filterNode(node, query: string): any | null {
    const filteredSubfolders = node.subfolders
      ? node.subfolders
          .map((subfolder) => this.filterNode(subfolder, query)) // Recursively filter subfolders
          .filter((subfolder) => subfolder !== null) // Remove non-matching subfolders
      : [];

    // Check if the folder name or any subfolder matches the search query
    if (
      node.name.toLowerCase().includes(query) ||
      filteredSubfolders.length > 0
    ) {
      return { ...node, subfolders: filteredSubfolders }; // Include matched folder and its subfolders
    }

    return null; // Return null if no match
  }

  // Called when the search query changes
  onSearchChange() {
    this.filterFolders();
  }

  hasChild = (_: number, node) => node.expandable;

  // Toggle Sidebar visibility
  toggleSidebar() {
    const content = this.el.nativeElement.querySelector('.mat-sidenav-content');
    this.isOpened = !this.isOpened;

    if (this.isOpened) {
      this.renderer.setStyle(content, 'margin-left', '260px');
    } else {
      this.renderer.setStyle(content, 'margin-left', '0px');
    }
  }

  // Toggle Folder selection
  toggleFolderSelection(folder) {
    folder.selected = !folder.selected;
  }

  onDragStarted(node: any) {
    console.log('Drag started', node);
  }

  // Handle drag end event
  onDragEnded(node: any) {
    console.log('Drag ended', node);
  }

  findFolderIndex(folderId: number, folders: any[]): number {
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id === folderId) {
        return i;
      }

      if (folders[i].subfolders) {
        const childIndex = this.findFolderIndex(
          folderId,
          folders[i].subfolders
        );
        if (childIndex !== -1) {
          return childIndex;
        }
      }
    }
    return -1;
  }

  // Handle the drop event
  onNodeDrop(event: CdkDragDrop<any[]>) {
    console.log(event, '-----');
    const draggedNode = event.item.data;
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (draggedNode && draggedNode.hasOwnProperty('name')) {
      console.log('Moving folder:', draggedNode.name);

      this.moveFolderAndFilesInArray(
        this.listFolders,
        previousIndex,
        currentIndex,
        draggedNode
      );
      this.dataSource.data = [...this.listFolders];
    } else {
      console.error('Invalid node data or missing properties:', draggedNode);
    }
  }

  moveFolderAndFilesInArray(
    array: any[],
    fromIndex: number,
    toIndex: number,
    draggedNode: any
  ) {
    const folderToMove = array[fromIndex];
    const filesToMove = folderToMove.subfolders;

    array.splice(fromIndex, 1);
    array.splice(toIndex, 0, folderToMove);
    filesToMove.forEach((folder) => {
      folder.parentId = folderToMove.id;
    });
    folderToMove.subfolders = filesToMove;

    this.adjustParentChildRelationships();
  }

  adjustParentChildRelationships() {
    this.listFolders.forEach((folder) => {
      folder.subfolders.forEach((subfolder) => {
        subfolder.parentId = folder.id;
      });

      if (folder.subfolders) {
        folder.subfolders.forEach((childFolder) => {
          childFolder.parentId = folder.id;
        });
      }
    });
  }

  addFolder() {
    const newNode= {
      id:this.listFolders.lenth !== 0 ? this.listFolders.length + 1 : 1,
      userId:this.userId.id,
      parentId:null,
      name: `Dosje e re ${this.listFolders.length + 1}`,
      subfolders: [],
    };

    this.listFolders.push(newNode);
    this.dataSource.data = this.listFolders;

    this.mockService.createFolder(newNode).subscribe(
      (response) => {
        console.log('Folder created successfully:', response);
      },
      (error) => {
        console.error('Ndodhi nje gabim', error);
      }
    );
  }


  
  deleteFolder(node) {
    this.mockService.deleteFolder(node.id).subscribe(
      (response) => {
        console.log('Folder deleted:', response);
        this.listFolders = this.listFolders.filter(
          (folder) => folder.id !== node.id
        );
        this.dataSource.data = this.listFolders;
      },
      (error) => {
        console.error('Error deleting folder:', error);
      }
    );
  }

  enableEditing(node): void {
    node.isEditing = true;
  }


goToFiles(node) {
  console.log(node.parentId); // Logs the parentId of the node
  
  this.listFolders.forEach(folder => {
    if (folder.id === node.parentId) {
      // Check if the folder contains subfolders
      if (folder.subfolders) {
        // Find the matching subfolder based on node.id
        const found = this.findFolderById(node.id, folder.subfolders);
        if (found) {
          this.dataToPass = found.files; // Pass the found subfolder to dataToPass
          console.log('Found Subfolder:', found);
          return found; // Return the subfolder if found
        }
      }
    }
  });
}

// Helper function to recursively search for the subfolder by its id
findFolderById(id: number, subfolders: any[]): any {
  for (let subfolder of subfolders) {
    if (subfolder.id === id) {
      return subfolder; // Return the subfolder if its ID matches
    } else if (subfolder.subfolders) {
      // If subfolder has its own subfolders, recursively search in them
      const found = this.findFolderById(id, subfolder.subfolders);
      if (found) {
        return found;
      }
    }
  }
  return null; // Return null if no matching subfolder is found
}


  saveNode(node): void {
    const dialogRef = this.dialog.open(EditComponent, {
      data: {
        docId: node.id,
        docName: node.name,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedFolder = { name: result };
        this.mockService.updateFolderName(node.id, updatedFolder).subscribe(
          (response) => {
            console.log('Folder updated:', response);
            this.getFolders();
          },
          (error) => {
            console.error('Error updating folder:', error);
          }
        );
      }
    });
  }

  addSubfolder(folderId) {
    console.log(folderId,"poqo")
    const newSubfolder= {
      parentId: folderId.id, 
      name: `Nen-Dosje e re`,
      uploadedAt: new Date().toISOString(),  // Current timestamp
      files: []  // Subfolders can have files as well, initially empty
    };

    this.mockService.addSubfolder(folderId.id, newSubfolder).subscribe(
      (response) => {
  
          this.getFolders() // Assuming the response includes the new subfolde
      },
      (error) => {
        console.error('Error adding subfolder:', error);
      }
    );
  }


  saveSubfolder( subfolder){
    debugger

  }
  refresh() {}

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;

    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
