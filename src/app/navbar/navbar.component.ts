import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileHoverService } from '../profile-hover-service.service';
import { AuthServiceService } from '../auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  public hoverService = inject(ProfileHoverService);

  readonly serverUrl = 'http://localhost:3000/'; 
  protected name = sessionStorage.getItem('userName');
  protected email = sessionStorage.getItem('userEmail')
  private authservice = inject(AuthServiceService)
  private router = inject(Router)

  logOut(){
    this.authservice.logout();
    this.router.navigate(['/']);
  }

  addBrand(){
    this.router.navigate(['/brand_details']);
  }

  addCar(){
    this.router.navigate(['/car_details']);
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
