import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileHoverService } from '../profile-hover-service.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  
}
