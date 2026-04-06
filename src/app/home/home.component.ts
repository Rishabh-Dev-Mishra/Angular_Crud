import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private router = inject(Router)
goToInven() {
  const user_id = sessionStorage.getItem("user_id");
  if (user_id) {
    this.router.navigate(['/allcars']); // Results in: /brands/5
  } else {
    console.log("error");
    
  }
}
}
