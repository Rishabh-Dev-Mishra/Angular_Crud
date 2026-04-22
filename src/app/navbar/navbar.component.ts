import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileHoverService } from '../profile-hover-service.service';
import { AuthServiceService } from '../auth-service.service';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  public hoverService = inject(ProfileHoverService);
  private dataservice = inject(DataService)

  readonly serverUrl = environment.apiUrl; 
  protected name = this.dataservice.userName();
  protected email = this.dataservice.userEmail();
  private authservice = inject(AuthServiceService)
  private router = inject(Router)

  logOut(){
    this.dataservice.logOut().subscribe();
    this.authservice.logout();
    this.router.navigate(['/']);
  }


 user_id: string = this.dataservice.getUserId()?? '';

addBrand() {
  const userId = sessionStorage.getItem("user_id");
  if (userId) {
    this.router.navigate(['/brand_details']); 
  } else {
    this.router.navigate(['/login']);
  }
}

addCar() {
  const userId = sessionStorage.getItem("user_id");
  if (userId) {
    this.router.navigate(['/car_details', userId]); 
  } else {
    this.router.navigate(['/login']);
  }
}

role = this.dataservice.getUserRole();

  checkUser(){
    if(this.role=='admin')return true;
    return false;
  }

  get imageURL(): string {
  const path = this.dataservice.img_path();
  if(path !== null && path.length > 0)
    return path ? `${path}` : '';
  return '';
  }
}
