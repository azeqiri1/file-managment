import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Router } from '@angular/router';
import { MockApiService } from 'src/app/services/mock-api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent {
  user:any;
  userName:any; 
  isDarkTheme:boolean= false;
  folders: any[] = [];  // This will hold the fetched folders
  treeControl: FlatTreeControl<any>;
  currentPath: string[] = [];


  // Define MatTreeFlattener to flatten the tree structure
  treeFlattener: MatTreeFlattener<any, any>;

  // Define MatTreeFlatDataSource to provide the flattened data to mat-tree
  treeDataSource: MatTreeFlatDataSource<any, any>;
 
  @Input() theme: string = "light";
   constructor(private router:Router,
    private mockService:MockApiService
   ) {
    const userData = localStorage.getItem('currentUser');

    // Check if user data exists in localStorage
    if (userData) {
      // Parse the JSON data from localStorage
      this.user = JSON.parse(userData);
      this.userName=this.user.username
      this.treeFlattener = new MatTreeFlattener(
        (node: any, level: number) => ({
          ...node,
          level
        }),
        (node: any) => node.level,  // Get the level of the node (used for indentation)
        (node: any) => !!node.children,  // Check if the node has children (to manage expand/collapse)
        (node: any) => node.children || []  // Get the children of the node
      );
  
      // Define the FlatTreeControl to manage the tree's expansion state
      this.treeControl = new FlatTreeControl<any, any>(
        (node: any) => node.level,  // Use the level for indentation
        (node: any) => !!node.children  // Only expand nodes that have children
      );
  
      // Initialize MatTreeFlatDataSource with the flattener
      this.treeDataSource = new MatTreeFlatDataSource(
        this.treeControl,
        this.treeFlattener
      );
    }

    // set theme
    this.theme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", this.theme);
  }

ngOnInit(){
  this.getFolders();
}
  getFolders(){
    this.mockService.getFolders().subscribe(
      (data) => {
        this.folders = data;  
        this.folders = data;
        const treeData = this.buildTreeData(this.folders);
        this.treeDataSource.data = treeData;
      },
      (error) => {
        console.error('Error fetching folders:', error);
      }
    );
   }

   onFolderClick(folder: any, parentFolderName: string | null) {
    const newPath = parentFolderName ? [...this.currentPath, parentFolderName, folder.name] : [...this.currentPath, folder.name];
    this.currentPath = newPath;

    // Display the content based on the folder clicked (you can add content logic here)
    console.log('Current Folder Path:', newPath);
  }

   buildTreeData(folders: any[]): any[] {
    return folders.map(folder => ({
      ...folder,
      children: folder.children ? this.buildTreeData(folder.children) : []
    }));
  }
  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

  refresh(){

  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    
    // Apply the dark theme class to the body
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem("theme", "light");
    }
  }

 
}
