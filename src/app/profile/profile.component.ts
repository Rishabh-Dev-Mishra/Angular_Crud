import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  
  private dataservice = inject(DataService);
  readonly serverUrl = 'http://localhost:3000/'; 

  get imageURL(): string {
  const path = localStorage.getItem('userImage'); 
  return path ? `${this.serverUrl}uploads/${path}` : '';
  }
}
