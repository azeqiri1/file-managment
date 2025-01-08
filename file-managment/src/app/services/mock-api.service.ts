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

  getFolders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/folders`);
  }

  getSharedFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/shared-files`);
  }
}
