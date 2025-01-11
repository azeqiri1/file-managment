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

interface FolderNode {
  name: string;
  files?: FileNode[];
}

interface FileNode {
  name: string;
}


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private _transformer = (node: FolderNode, level: number) => {
    return {
      expandable: !!node.files && node.files.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.files
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  user: any;
  userName: any;
  isDarkTheme: boolean = false;
  listFolders: any;
  currentPath: string[] = [];
  isOpened = false;
  userId: any = JSON.parse(localStorage.getItem('currentUser'));
  selectedFolders = [];
  isPanelExpanded = false;

  @Input() theme: string = 'light';

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private mockService: MockApiService,
    private cdr: ChangeDetectorRef
  ) {
  
  }

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
        let TREE_DATA: FolderNode[] = [];
        this.listFolders = data;
        TREE_DATA = this.listFolders;
        this.dataSource.data = TREE_DATA;
        
      },
      (error) => {
        console.error('Error fetching folders:', error);
      }
    );
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

 


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
    // Traverse recursively to find the folder by its ID
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id === folderId) {
        return i;  // Return index of the folder when found
      }
  
      // If the folder has children, recursively search inside them
      if (folders[i].children) {
        const childIndex = this.findFolderIndex(folderId, folders[i].children);
        if (childIndex !== -1) {
          return childIndex;  // Return the child index if found
        }
      }
    }
    return -1;  // Return -1 if the folder was not found
  }
  

// Handle the drop event
onNodeDrop(event: CdkDragDrop<any[]>) {
  console.log(event,'-----')
  const draggedNode = event.item.data;  
  const previousIndex =event.previousIndex 
  const currentIndex = event.currentIndex; // New index where the folder is dropped

  // Ensure draggedNode is properly defined and has the necessary structure
  if (draggedNode  && draggedNode.hasOwnProperty('name')) {
    console.log('Moving folder:', draggedNode.name);

    // Move the folder and its files in the array
    this.moveFolderAndFilesInArray(this.listFolders, previousIndex, currentIndex, draggedNode);

    // Update dataSource after moving
    this.dataSource.data = [...this.listFolders];  // Re-sync the tree data source
  } else {
    console.error('Invalid node data or missing properties:', draggedNode);
  }
}

// Move the folder and its files in the array
moveFolderAndFilesInArray(array: any[], fromIndex: number, toIndex: number, draggedNode: any) {
  // Step 1: Remove the folder and its files from the original index
  const folderToMove = array[fromIndex];
  const filesToMove = folderToMove.files;  // Files inside the folder

  // Remove the folder from the array
  array.splice(fromIndex, 1);

  // Step 2: Insert the folder at the new index
  array.splice(toIndex, 0, folderToMove);

  // Step 3: Update the parentId of the files if necessary
  filesToMove.forEach(file => {
    file.parentId = folderToMove.id;  // Ensure the file's parentId is updated to the new folder's id
  });

  // Step 4: Ensure child relationships are updated properly
  folderToMove.files = filesToMove;  // Reassign the files to the folder

  // Optionally, update parent-child relationships for all folders
  this.adjustParentChildRelationships();
}

// Adjust parent-child relationships for all folders
adjustParentChildRelationships() {
  this.listFolders.forEach(folder => {
    folder.files.forEach(file => {
      file.parentId = folder.id;  // Ensure each file's parentId is correctly set to the folder's id
    });

    // Recursively check child folders, if any
    if (folder.children) {
      folder.children.forEach(childFolder => {
        childFolder.parentId = folder.id;  // Set the parentId for child folders
      });
    }
  });
}

addFolder(){
    const newNode: FolderNode = { name: `New Node ${this.listFolders.length + 1}`, files: [] };
    this.listFolders.push(newNode);
    this.dataSource.data = this.listFolders;

}

  // Refresh function
  refresh() {}

  // Logout function
  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  // Toggle Theme
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
