import { Component, inject } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { DataService } from '../data.service';
import { ProfileHoverService } from '../profile-hover-service.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-todo',
  standalone: true, // Ensure this is present for imports to work
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {
  
}
