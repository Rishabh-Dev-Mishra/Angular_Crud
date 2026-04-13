import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileHoverService } from '../profile-hover-service.service';
import { AuthServiceService } from '../auth-service.service';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  public hoverService = inject(ProfileHoverService);
  private dataservice = inject(DataService)

  readonly serverUrl = 'http://localhost:3000/'; 
  protected name = sessionStorage.getItem('userName');
  protected email = sessionStorage.getItem('userEmail')
  private authservice = inject(AuthServiceService)
  private router = inject(Router)

  logOut(){
    this.dataservice.logOut().subscribe();
    this.authservice.logout();
    this.router.navigate(['/']);
  }

 // navbar.component.ts

 user_id: string = this.dataservice.getUserId()?? '';

addBrand() {
  const userId = sessionStorage.getItem("user_id");
  if (userId) {
    // Navigates to /brand_details/5
    this.router.navigate(['/brand_details', userId]); 
  } else {
    this.router.navigate(['/login']);
  }
}

addCar() {
  const userId = sessionStorage.getItem("user_id");
  if (userId) {
    // Navigates to /car_details/5
    this.router.navigate(['/car_details', userId]); 
  } else {
    this.router.navigate(['/login']);
  }
}

  checkUser(){
    const name = sessionStorage.getItem('userName');
    const email = sessionStorage.getItem('userEmail');
    if(name == "Rishabh" && email == 'rd@rd.com')return true;
    return false;
  }

  get imageURL(): string {
  const path = sessionStorage.getItem('userImage'); 
  if(path !== null && path.length > 0)
    return path ? `${this.serverUrl}uploads/${path}` : '';
  return '';
  }
}
