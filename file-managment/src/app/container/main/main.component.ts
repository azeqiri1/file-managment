import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';
import { FileDialogComponent } from './file-dialog/file-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnChanges {
  @Input() files: any;
  gridView: boolean = true;
  searchText: string = '';
  searchQuery: string = '';
  tagFilter: string[] = [];
  sortOrder: string = 'name'; // Default sort by name
  availableTags: string[] = ['logo', 'design', 'pdf'];
  file: any;
  constructor(private dialog: MatDialog) {}

  // This lifecycle hook detects changes to the input properties
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['files']) {
      const prevValue = changes['files'].previousValue;
      const currentValue = changes['files'].currentValue;

      this.files = currentValue;
    }
  }

  // This method changes the grid view state
  changeGrid() {
    this.gridView = !this.gridView;
  }

  // This method opens the dialog for adding a document
  addDocument() {
    const dialogRef = this.dialog.open(DialogContentComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  filterByTags(file): boolean {
    if (!this.tagFilter.length) return true;
    return this.tagFilter.every((tag) => file.tags.includes(tag));
  }

  // Search files by name
  searchFiles(file): boolean {
    return file.name.toLowerCase().includes(this.searchQuery.toLowerCase());
  }

  // Sort files by different criteria
  sortFiles(files) {
    return files.sort((a, b) => {
      if (this.sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      } else if (this.sortOrder === 'size') {
        return a.size - b.size;
      }
      return 0;
    });
  }

  // Open a dialog with file details
  openFileDialog(file) {
    const dialogRef = this.dialog.open(FileDialogComponent, {
      data: file,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('File dialog closed');
    });
  }

  // Handle drag-and-drop (for example, with a custom library or Angular CDK)
  onDragStart(event: DragEvent, file) {
    console.log('Dragging file:', file);
  }

  onDrop(event: DragEvent, file) {
    console.log('Dropped file:', file);
  }

  // Clear the search text
  searchClose() {
    this.searchText = '';
  }
}
