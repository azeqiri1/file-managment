import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainComponent } from './main/main.component';
import { SubfolderComponent } from './subfolder/subfolder.component';

const routes: Routes = [
  { path: '', component: DashboardComponent,   children: [
    { path: 'folder/:folderId', component: MainComponent }, // Main folder route
    { path: 'folder/:folderId/subfolder/:subfolderId', component: SubfolderComponent }, // Subfolder route
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' } // Default folder route
  ]},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContainerRoutingModule { }
