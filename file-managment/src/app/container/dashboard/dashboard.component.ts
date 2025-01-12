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
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MockApiService } from 'src/app/services/mock-api.service';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from './edit/edit.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  // Flattening function to transform the tree structure
  private _transformer = (node, level: number) => {
    return {
      ...node, // Keep all properties from the node
      expandable: true, // Make only top-level folders expandable
      level: level, // Indicate the nesting level
    };
  };
  treeControl = new FlatTreeControl<any>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.subfolders
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // Properties
  user: any;
  userName: any;
  isDarkTheme: boolean = false;
  isEditing: boolean = false;
  listFolders: any[] = []; // List of folders
  subfolders: any[] = []; // List of subfolders
  filteredFolders: any[] = []; // Filtered list of folders
  currentPath: string[] = [];
  isPanelExpanded = false;
  // Track the current path in the navigation
  isOpened = false; // Sidebar visibility
  userId: any = JSON.parse(localStorage.getItem('currentUser')); 
  // Get current user from localStorage
  selectedFolders = []; // Selected folders for deletion, etc.
  searchQuery: string = ''; // Search query for filtering folders and subfolders
  @Input() theme: string = 'light';
  subfoldersArray: any; // Theme input

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private mockService: MockApiService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
  
    this.getFolders(); // Initialize folders and subfolders
    this.setupTheme(); // Set up theme based on localStorage
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

  getFolders() {
    this.mockService.getFoldersByUserId(this.userId.id).subscribe(
      (data) => {
        this.listFolders = data;
        this.filteredFolders = [...this.listFolders];
        this.getSubfolders();
      },
      (error) => {
      }
    );
  }

  getSubfolders() {
    this.mockService.getAllSubfolders().subscribe(
      (subfolders) => {
        this.subfoldersArray = subfolders;
        this.listFolders.forEach((folder) => {
          const filteredSubfolders = subfolders.filter(
            (subfolder) => subfolder.parentId === folder.id
          );
          folder.subfolders = filteredSubfolders; 
        });

        this.dataSource.data = [...this.listFolders];
      },
      (error) => {
        console.error('Error fetching subfolders', error);
      }
    );
  }

  transformer(node, level: number) {
    return {
      ...node,
      expandable: level === 0, 
      level: level,
    };
  }

  hasChild = (_: number, node) => node.expandable;

  filterFolders() {
    if (!this.searchQuery.trim()) {
      this.filteredFolders = [...this.listFolders];
    } else {
      this.filteredFolders = this.listFolders
        .map((folder) =>
          this.filterNode(folder, this.searchQuery.toLowerCase())
        )
        .filter((folder) => folder !== null); 
    }
    this.dataSource.data = this.filteredFolders;
  }

  filterNode(node, query: string): any | null {
    const filteredSubfolders = node.subfolders
      ? node.subfolders
          .map((subfolder) => this.filterNode(subfolder, query)) 
          .filter((subfolder) => subfolder !== null) 
      : [];
    if (
      node.name.toLowerCase().includes(query) ||
      filteredSubfolders.length > 0
    ) {
      return { ...node, subfolders: filteredSubfolders }; 
    }

    return null; // No match found
  }

  // Called when the search query changes
  onSearchChange() {
    this.filterFolders();
  }

  // Toggle the sidebar visibility
  toggleSidebar() {
    const content = this.el.nativeElement.querySelector('.mat-sidenav-content');
    this.isOpened = !this.isOpened;

    if (this.isOpened) {
      this.renderer.setStyle(content, 'margin-left', '260px');
    } else {
      this.renderer.setStyle(content, 'margin-left', '0px');
    }
  }

  // Toggle folder selection for multiple actions
  toggleFolderSelection(folder) {
    folder.selected = !folder.selected;
  }

  // Handle the drag and drop event for folders and subfolders
  onNodeDrop(event: CdkDragDrop<any[]>) {
    const draggedNode = event.item.data;
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (draggedNode) {
      this.moveFolderAndFilesInArray(
        this.listFolders,
        previousIndex,
        currentIndex,
        draggedNode
      );
      this.mockService
        .updateFolderPosition(draggedNode.id, { position: currentIndex })
        .subscribe();

      this.dataSource.data = [...this.listFolders];
    }
  }

  // Move a folder and its subfolders in the array
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

    folderToMove.position = toIndex;

    filesToMove.forEach((subfolder, index) => {
      subfolder.position = index;
      subfolder.parentId = folderToMove.id;
    });

    folderToMove.subfolders = filesToMove;
  }

  // Add a new folder (top-level folder)
  addFolder() {
    const newFolder = {
      id: this.generateNewFolderId(),
      position: this.listFolders.length,
      subfolders: [], // Subfolders array is empty initially
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      userId: this.userId.id,
      name: `Dosje e re ${this.listFolders.length + 1}`,
    };
    console.log(newFolder,'qo')
    this.listFolders.push(newFolder);
    this.dataSource.data = this.listFolders;
    this.mockService.addFolder(newFolder).subscribe();
  }

  // Add a subfolder under a specific parent folder
  addSubfolder(parentFolder) {
    const newSubfolder = {
      id: this.generateSubFolderLength(), // New unique ID for the subfolder
      parentId: parentFolder.id, // Associate subfolder with its parent folder
      name: `Nen-Dosje e re`,
      createdBy: this.userId.username,
      uploadedAt: new Date().toISOString(),
      files: [],
    };

    // Call the API to add the new subfolder
    this.mockService.addSubfolder(newSubfolder).subscribe(() => {
      this.getFolders(); // Refresh folders and subfolders from API
    });
  }

  // Generate a new unique ID for folders and subfolders
  generateNewFolderId(): number {
    if (this.listFolders.length === 0) {
      return 1; // If no folders, start with ID 1
    }

    const highestId = Math.max(
      ...this.listFolders.map((folder) => folder.id),
      0
    ); // Get the highest ID from existing folders
    return highestId + 1;
  }
  generateSubFolderLength() {
    if (this.subfoldersArray.length === 0) {
      return 1; // If no folders, start with ID 1
    }

    const highestId = Math.max(
      ...this.subfoldersArray.map((subfolder) => subfolder.id),
      0
    ); // Get the highest ID from existing folders
    return highestId + 1;
  }

  // Delete a folder from the list
  deleteFolder(node) {
    const indexToDelete = this.listFolders.findIndex(
      (folder) => folder.id === node.id
    );

    if (indexToDelete !== -1) {
      this.listFolders.splice(indexToDelete, 1);
      this.listFolders.forEach((folder, index) => {
        folder.position = index;
      })
     
      this.dataSource.data = this.listFolders;

      this.mockService.deleteFolder(node.id).subscribe();
    }
  }

  deleteSubfolder(node) {
    const indexToDelete = this.subfoldersArray.findIndex(
      (subfolder) => subfolder.id === node.id
    );

    if (indexToDelete !== -1) {
      this.subfoldersArray.splice(indexToDelete, 1);
      this.subfoldersArray.forEach((subfolder, index) => {
        subfolder.position = index;
      });

    this.getFolders()
      this.mockService.deleteSubfolder(node.id).subscribe();
    }
  }

  // Navigate to a specific folder
  goToFolder(folderId: string) {
    this.router.navigate([`/dashboard/folder/${folderId}`], {
      queryParams: { folderId },
    });
  }

  // Find the parent folder for a given subfolder
  findParentFolder(subfolderId: number) {
    for (const folder of this.listFolders) {
      const subfolder = folder.subfolders.find(
        (sf) => sf.parentId === folder.id && sf.id === subfolderId
      );
      if (subfolder) {
        return folder;
      }
    }
    return null;
  }

  // Navigate to a specific subfolder
  goToSubfolder(subfolder: any) {
    const parentFolder = this.findParentFolder(subfolder.id);
    this.router.navigate([`/dashboard/folder/${parentFolder.id}/subfolder/${subfolder.id}`], {
      queryParams: {
        subfolder: subfolder.id, // Serialize the object to a string
      },
    });
  }

  // Open dialog for editing folder name
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
        this.mockService
          .updateFolderName(node.id, updatedFolder)
          .subscribe(() => {
            this.getFolders();
          });
      }
    });
  }


  saveNodeSubfolder(node): void {
    const dialogRef = this.dialog.open(EditComponent, {
      data: {
        docId: node.id,
        docName: node.name,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedFolder = { name: result };
        this.mockService
          .updateSubfolderName(node.id, updatedFolder)
          .subscribe(() => {
            this.getFolders();
          });
      }
    });
  }
  


  // Refresh the component (if needed)
  refresh() {}

  // Logout the current user
  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  // Toggle the theme between dark and light
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
