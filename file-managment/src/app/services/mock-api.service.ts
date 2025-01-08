// src/app/mock-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {

  private apiUrl = 'http://localhost:3000';  // URL to your mock API (JSON Server)

  constructor(private http: HttpClient) { }

  // Simulate login by fetching user data
  login(username: string, password: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users?username=${username}&password=${password}`);
  }

  // Get folders (file manager folder structure)
  getFolders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/folders`);
  }

  // Get shared files (if applicable)
  getSharedFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/shared-files`);
  }
}
