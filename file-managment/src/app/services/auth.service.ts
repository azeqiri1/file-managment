// src/app/auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MockApiService } from './mock-api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private mockApiService: MockApiService, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(username: string, password: string): Observable<any> {
    return this.mockApiService.login(username, password).pipe(
      // Assuming successful login, store the user and token in localStorage
      tap(response => {
        if (response.length > 0) { // User found
          const user = response[0];
          const token = `${user.role}-token`;  // Simulate token generation
          localStorage.setItem('currentUser', JSON.stringify({ ...user, token }));
          this.currentUserSubject.next({ ...user, token });
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
