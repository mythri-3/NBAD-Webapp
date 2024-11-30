import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  loginForm: FormGroup;
  message: string = '';
  errors: any = {};
  isLoggedIn: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  ngOnInit(): void {
    // Simulate checking login status from local storage or an API
    const user = localStorage.getItem('token');
    this.isLoggedIn = !!user; // Set `isLoggedIn` based on stored user data
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errors = { server: 'username and password are required.' };
      return;
    }

    const loginData = this.loginForm.value;
    this.http.post<any>('http://137.184.71.81:3000/api/login', loginData)
      .subscribe(
        (response) => {
          if (response.success) {
            localStorage.setItem('token', response.token);
            this.router.navigate(['/dashboard']);
          } else {
            this.errors = { server: response.message };
          }
        },
        (error) => {
          if (error.status === 401) {
            this.errors = { server: 'Incorrect username or password' };
          } else if (error.status === 404) {
            this.errors = { server: 'User not found' };
          } else {
            this.errors = { server: error.message || 'An error occurred during login.' };
          }
        }
      );
  }
}
