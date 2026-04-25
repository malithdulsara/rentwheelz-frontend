import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // Login Method
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          sessionStorage.setItem('token', response.token);
        }
      })
    );
  }

  register(userData: any): Observable<any> {

    const payload = {
      ...userData,
      role: 'ROLE_CUSTOMER'
    };

    return this.http.post<any>(`${this.apiUrl}/register`, payload).pipe(
      tap((response: any) => {
        if (response && response.token) {
          sessionStorage.setItem('token', response.token);
        }
      })
    );
  }

  getRole(): string | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role; 
    } catch (e) {
      console.error("Token decoding failed", e);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); 
      
      if (decoded.exp < currentTime) {
        sessionStorage.removeItem('token'); 
        sessionStorage.removeItem('role');
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  logout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getUserEmail(): string | null {
    const token = sessionStorage.getItem('token'); 
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub; 
      } catch (e) {
        console.error("Error decoding token", e);
        return null;
      }
    }
    return null;
  }
}