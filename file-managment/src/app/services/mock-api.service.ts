// src/app/mock-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,catchError,forkJoin, switchMap } from 'rxjs';

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


  addFolder(folder: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/folders`, folder);
  }
  

  deleteFolder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/folders/${id}`);
  }
  deleteSubfolder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subfolders/${id}`);
  }

  updateSubfolder(subfolder: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/subfolders/${subfolder.id}`, subfolder);
  }

  // DELETE request for deleting multiple folders
  deleteFolders(ids: number[]): Observable<any> {
    // Create an array of observables for each delete request
    const deleteRequests = ids.map(id => this.http.delete(`${this.apiUrl}/folders/${id}`));

    // Use forkJoin to execute all delete requests in parallel and wait for all to complete
    return forkJoin(deleteRequests);
  }

  getAllSubfolders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subfolders`);
  }
  updateFolderName(folderId: number, updatedFolder: { name: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/folders/${folderId}`, updatedFolder);
  }

  updateSubfolderName(folderId: number, updatedFolder: { name: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/subfolders/${folderId}`, updatedFolder);
  }

  getSubfoldersByFolderId(parentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subfolders/?parentId=${parentId}`);
  }

  getFiles(subFolderId): Observable<any> {
    return this.http.get(`${this.apiUrl}/subfolders/?id=${subFolderId}`);
  }

  updateParentId(ids: number[], newParentId: number): Observable<any> {
    const updateRequests = ids.map(id => 
      this.http.patch(`${this.apiUrl}/subfolders/${id}`, { parentId: newParentId }).pipe(
        catchError(error => {
          console.error(`Error updating parentId for item with ID ${id}:`, error);
          return [];
        })
      )
    );
    return forkJoin(updateRequests);  // Execute all updates concurrently
  }


  deleteMultiple(ids: number[]): Observable<any> {
    const deleteRequests = ids.map(id => 
      this.http.delete(`${this.apiUrl}/subfolders/${id}`).pipe(
        catchError(error => {
          console.error(`Error deleting item with ID ${id}:`, error);
          return [];
        })
      )
    );
    return forkJoin(deleteRequests); // Now using forkJoin
  }
  updateFolderPosition(folderId: number, updatedPosition: { position }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/folders/${folderId}`, updatedPosition);
  }
  
  addSubfolder( subfolder): Observable<any> {
    return this.http.post(`${this.apiUrl}/subfolders`, subfolder);
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
