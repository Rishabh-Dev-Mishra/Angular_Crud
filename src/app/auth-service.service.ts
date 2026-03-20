import { Token } from '@angular/compiler';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor() { }
  isLoggedIn = signal<boolean>(!!localStorage.getItem('auth_token'));
  login(token:string){
    localStorage.setItem('auth_token', token)
    this.isLoggedIn.set(true);
  }
  logout(){
    localStorage.removeItem('auth_token')
    this.isLoggedIn.set(false); 
  }
}
