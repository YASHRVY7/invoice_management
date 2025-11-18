import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  username: string | null = null;
  userInitial: string = 'U';

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    if (this.username) {
      this.userInitial = this.username.charAt(0).toUpperCase();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
