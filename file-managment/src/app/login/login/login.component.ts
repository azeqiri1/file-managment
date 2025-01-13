
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'; 
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router'; 
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup; // Declare the form group

  constructor(private authService: AuthService, private router: Router,private snackBar: MatSnackBar ) {}

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
        }  else {
          this.snackBar.open('Perdorues/Fjalekalim i gabuar', 'Mbyll', {
            duration: 3000, 
            horizontalPosition: 'center', 
            verticalPosition: 'top',
            panelClass: ['error-toast'], 
          });
        }
      },
      (error) => {
       
      }
    );
  }
}
