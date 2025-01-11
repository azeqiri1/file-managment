import { Component, Input, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  @Input() folder: string[];
  constructor(private dialog: MatDialog,
    ){

  }
 
  ngOnChanges(changes: SimpleChanges) {
    if (changes['folder']) {
      console.log('folder input changed:', this.folder);
    }
  }
  addDocument()

{
  const dialogRef = this.dialog.open(DialogContentComponent);

  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
  });
}
}