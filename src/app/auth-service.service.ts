import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthServiceService {
  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken'); 
  }

  login(token: string) {
    localStorage.setItem('userToken', token);
  }

  logout() {
    localStorage.removeItem('userToken');
  }
}

