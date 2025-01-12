// src/app/mock-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,forkJoin, switchMap } from 'rxjs';

// src/app/folder-node.model.ts
export interface Subfolder {
  id: number;
  name: string;
  uploadedAt: string;
  files: any[]; // You can define a type for file objects if needed
}

export interface FolderNode {
  id: number;
  name: string;
  level: number;
  expandable: boolean;
  subfolders: Subfolder[]; // Ensure the subfolders are typed
  isEditing?: boolean; // Optional field for editing state
}

@Injectable({
  providedIn: 'root'
})
export class MockApiService {

  private apiUrl = 'http://localhost:3000';  

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users?username=${username}&password=${password}`);
  }

  getFoldersByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/folders?userId=${userId}`);
  }

  createFolder(newFolder): Observable<any> {
    return this.http.post(`${this.apiUrl}/folders`, newFolder);
  }

  deleteFolder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/folders/${id}`);
  }

  // DELETE request for deleting multiple folders
  deleteFolders(ids: number[]): Observable<any> {
    // Create an array of observables for each delete request
    const deleteRequests = ids.map(id => this.http.delete(`${this.apiUrl}/folders/${id}`));

    // Use forkJoin to execute all delete requests in parallel and wait for all to complete
    return forkJoin(deleteRequests);
  }

  updateFolderName(folderId: number, updatedFolder: { name: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/folders/${folderId}`, updatedFolder);
  }


  addSubfolder(folderId: number, newSubfolder): Observable<FolderNode> {
    return this.http.get<FolderNode>(`${this.apiUrl}/folders/${folderId}`).pipe(
      switchMap((folder: FolderNode) => {
        folder.subfolders = folder.subfolders || [];
        folder.subfolders.push(newSubfolder);
        
        // Update the folder with the new subfolder
        return this.http.put<FolderNode>(`${this.apiUrl}/folders/${folderId}`, folder);
      })
    );
  }
  
    // Delete selected files
    deleteFiles(files: any[]): Observable<any> {
      const fileIds = files.map((file) => file.id);
      return this.http.delete(`${this.apiUrl}/files`, { body: { ids: fileIds } });
    }
  
    // Move a file to a new folder
    moveFileToFolder(fileId: number, folderId: number): Observable<any> {
      return this.http.patch(`${this.apiUrl}/files/${fileId}`, { folderId: folderId });
    }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/files`, formData);
  }
  getSharedFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/shared-files`);
  }
}
