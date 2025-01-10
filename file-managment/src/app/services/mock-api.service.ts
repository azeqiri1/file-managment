// src/app/mock-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/files`, formData);
  }
  getSharedFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/shared-files`);
  }
}
