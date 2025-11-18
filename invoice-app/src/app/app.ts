import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('invoice-app');
  protected readonly currentUrl = signal<string>('');

  constructor(private router: Router) {
    // Set initial URL immediately
    this.currentUrl.set(this.router.url || window.location.pathname);
    
    // Update URL on navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl.set(event.url);
      });
  }

  protected readonly showNavbar = computed(() => {
    const url = this.currentUrl();
    // Hide navbar on login and signup pages
    // Also hide on root path since it redirects to signup
    const isLoginPage = url === '/login' || url.startsWith('/login');
    const isSignupPage = url === '/signup' || url.startsWith('/signup');
    const isRootPath = url === '/' || url === '';
    return !isLoginPage && !isSignupPage && !isRootPath;
  });
}
