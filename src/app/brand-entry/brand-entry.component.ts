import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-brand-entry',
  imports: [FormsModule , RouterLink, FooterComponent, NavbarComponent],
  templateUrl: './brand-entry.component.html',
  styleUrl: './brand-entry.component.css'
})
export class BrandEntryComponent {
  update(form:any){

  }
}
