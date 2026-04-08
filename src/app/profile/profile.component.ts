import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../data.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, NgIf, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  
  private dataservice = inject(DataService);
  readonly serverUrl = 'http://localhost:3000/'; 
  protected name = sessionStorage.getItem('userName');
  protected email = sessionStorage.getItem('userEmail')

  user_id = this.dataservice.getUserId();

  get imageURL(): string {
  const path = sessionStorage.getItem('userImage'); 
  return path && (path.length > 0) ? `${this.serverUrl}uploads/${path}` : '';
  }
}
