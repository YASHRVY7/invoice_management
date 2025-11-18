import { Component, OnInit } from '@angular/core';
import { Auth } from '../../../services/auth';
import { Route, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  username = '';
  password = '';
  errorMessage = '';
  loading = false;


  constructor(private authService: Auth, private router: Router) { }

  ngOnInit() {
    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }
    this.loading = true;
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.errorMessage = '';
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    })
  }
}
