import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent {
  docName: string = '';
  docData: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<EditComponent>
) {
    this.docData = data;
  }

  ngOnInit(): void {
    this.docName = this.docData.docName;
  }

update(){
  this.dialogRef.close(this.docName); 
}
  close() {
    this.dialogRef.close();
  }
}
