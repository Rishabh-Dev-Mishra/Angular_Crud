import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-car-entry',
  imports: [FooterComponent, NavbarComponent, RouterLink, FormsModule],
  templateUrl: './car-entry.component.html',
  styleUrl: './car-entry.component.css'
})
export class CarEntryComponent {
  update(form: any){

  }
}
