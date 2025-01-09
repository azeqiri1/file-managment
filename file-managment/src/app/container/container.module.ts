import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';  // Import MatToolbarModule
import { ContainerRoutingModule } from './container-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTreeModule } from '@angular/material/tree';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MainComponent } from './main/main.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { DialogContentComponent } from './dialog-content/dialog-content.component';
import { LoadPreviewComponent } from './dialog-content/load-preview/load-preview.component';




@NgModule({
  declarations: [
    DashboardComponent,
    MainComponent,
    DialogContentComponent,
    LoadPreviewComponent
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    ContainerRoutingModule,
    MatInputModule,
    MatButtonModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatOptionModule,
    MatDialogModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatTreeModule,
    MatSelectModule,
    MatListModule,
    MatSnackBarModule,
    MatIconModule,
    MatCardModule,
    RouterModule,
    ReactiveFormsModule,
  ]
})
export class ContainerModule { }
