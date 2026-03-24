import { Component, inject } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { DataService } from '../data.service';
import { ProfileHoverService } from '../profile-hover-service.service';

@Component({
  selector: 'app-todo',
  standalone: true, // Ensure this is present for imports to work
  imports: [FooterComponent, RouterLink, NgIf],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {
  public hoverService = inject(ProfileHoverService);

  readonly serverUrl = 'http://localhost:3000/'; 
  protected name = sessionStorage.getItem('userName');
  protected email = sessionStorage.getItem('userEmail')

  get imageURL(): string {
  const path = sessionStorage.getItem('userImage'); 
  if(path !== null && path.length > 0)
    return path ? `${this.serverUrl}uploads/${path}` : '';
  return '';
  }
}
