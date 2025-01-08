// src/app/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'; // Import Reactive Forms classes
import { AuthService } from 'src/app/services/auth.service'; // AuthService to handle login logic
import { Router } from '@angular/router'; // Router for navigation

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup; // Declare the form group

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Initialize the login form with form controls and validators
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]), // Username control with required validator
      password: new FormControl('', [Validators.required])  // Password control with required validator
    });
  }

  onSubmit(): void {
    // Check if the form is valid
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value; // Get the form values

    // Call the AuthService to handle login
    this.authService.login(username, password).subscribe(
      (response) => {
        if (response.length > 0) {
          const user = response[0]; // Get the first user if found
          if (user) {
            // Navigate to the dashboard upon successful login
            this.router.navigate(['/dashboard']);
          }
        } else {
          alert('Invalid username or password'); // Alert for failed login
        }
      },
      (error) => {
        console.error('Login failed', error);
        alert('An error occurred during login'); // Handle login error
      }
    );
  }
}
