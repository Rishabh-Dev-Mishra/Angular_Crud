import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { ProfileHoverService } from '../profile-hover-service.service';

@Component({
  selector: 'app-todo',
  imports: [FooterComponent, RouterLink, NgIf],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {
  constructor(public hoverService: ProfileHoverService) {}
  imageURL: string = "https://media.newyorker.com/photos/59095bb86552fa0be682d9d0/master/pass/Monkey-Selfie.jpg";
  
}
