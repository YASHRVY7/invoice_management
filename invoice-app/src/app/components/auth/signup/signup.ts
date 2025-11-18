import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit {
    username='';
    email='';
    password='';
    errorMessage='';
    successMessage='';
    loading=false;


    constructor(private authService: Auth, private router: Router) {}

    ngOnInit() {
      // If already logged in, redirect to dashboard
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    }
    onSubmit() {
      if (!this.username || !this.email || !this.password) {
        this.errorMessage = 'All fields are required';
        this.successMessage = '';
        return;
      }
      this.loading = true;
      this.authService.signup({ username: this.username, email: this.email, password: this.password }).subscribe({
        next: () => {
          this.errorMessage = '';
          this.successMessage = 'Signup successful! Redirecting to login...';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/login']), 2500);
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Signup failed. Try another username/email.';
          this.successMessage = '';
          this.loading = false;
        },
      });
    }


}
