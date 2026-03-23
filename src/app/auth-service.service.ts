import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthServiceService {
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userToken'); 
  }

  login(token: string) {
    sessionStorage.setItem('userToken', token);
  }

  logout() {
    sessionStorage.removeItem('userToken');
  }
}

