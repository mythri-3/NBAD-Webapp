import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  // Check if the user is authenticated by verifying the presence of a token
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Force UI updates to reflect changes like login or logout
  updateView() {
    this.cdr.detectChanges();
  }

  // Logout function to clear user session and navigate to login page
  logoutUser() {
    localStorage.removeItem('token'); // Clear authentication token
    this.updateView();               // Ensure the navbar reflects the logged-out state
    this.router.navigate(['/signup']); // Redirect to the login page
  }
}
