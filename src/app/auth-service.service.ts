import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthServiceService {
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userToken'); 
  }

  saveToken(token:string){
    sessionStorage.setItem("userToken", token)
  }

  logout() {
    sessionStorage.clear();
  }
}

