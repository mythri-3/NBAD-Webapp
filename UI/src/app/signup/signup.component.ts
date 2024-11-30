import { Component } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  
  // User input fields
  username = '';
  password = '';
  confirmPassword = '';

  // Error handling and feedback
  errors: any = {};
  message = '';

  // Check if a user is logged in by validating token presence in localStorage
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  
  // Validate form fields and set error messages if needed
  validateForm(): boolean {
    const errors: any = {};

    if (!this.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!this.password.trim()) {
      errors.password = 'Password is required';
    }
    if (this.password !== this.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  // Handle form submission
  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.validateForm()) {
      try {
        // Send POST request to the server
        const response = await axios.post('http://137.184.71.81:3000/api/signup', {
          username: this.username,
          password: this.password,
        });

        console.log('Form submitted successfully!', response.data);
        this.message = 'Registration successful!';
      } catch (error: any) {
        // Handle server errors
        if (error.response?.data?.error?.includes('Duplicate Entry')) {
          this.errors.server = 'A user with the same details already exists.';
        } else {
          this.errors.server = error.response?.data?.error || 'Server error';
        }
        this.message = 'Registration failed. Please check the form.';
      }
    } else {
      // Handle validation errors
      console.log('Form validation failed');
      this.message = 'Please fill in all required fields.';
    }
  }
}
