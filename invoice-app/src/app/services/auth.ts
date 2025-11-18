import { Injectable } from '@angular/core';
import { API } from '../shared/constants/api.constants';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, LoginRequest, SignupRequest } from '../models/auth';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl=API.BASE+API.AUTH;

  constructor(private http:HttpClient){}

  signup(data:SignupRequest):Observable<any>{
    return this.http.post(`${this.baseUrl}/signup`,data)
  }

  login(data:LoginRequest):Observable<AuthResponse>{
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`,data).pipe(
      tap((res) => {
        if (res.access_token) {
          localStorage.setItem('token', res.access_token);
          console.log("User logged in");
        }
      })
    )
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Check if token is expired or invalid
    try {
      // Validate token format (JWT has 3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Invalid token format, remove it
        localStorage.removeItem('token');
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      
      // Check if token is expired
      if (Date.now() >= expiry) {
        // Token expired, remove it
        localStorage.removeItem('token');
        return false;
      }
      
      return true;
    } catch (e) {
      // Invalid token, remove it
      localStorage.removeItem('token');
      return false;
    }
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || null;
    } catch (e) {
      return null;
    }
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (e) {
      return null;
    }
  }
}
