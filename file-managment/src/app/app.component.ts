import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {

  constructor(private router: Router) {}
  title = 'file-managment';

  ngOnInit(): void {
   
    this.checkUserLoginStatus();
  }

  checkUserLoginStatus(): void {
    const user = localStorage.getItem('currentUser');
  
    if (user) {
      // If the user is already logged in, navigate to the dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // If not logged in, navigate to the login page
      this.router.navigate(['/login']);
    }
  
}
}