import { Component, inject, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
// ✅ CORRECT IMPORT BELOW
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-allcars',
  standalone: true, // Ensure this is here if you're using standalone
  imports: [FooterComponent, NavbarComponent, CommonModule, RouterLink],
  templateUrl: './allcars.component.html',
  styleUrl: './allcars.component.css'
})
export class AllCarsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataservice = inject(DataService);
  private router = inject(Router); // This will now correctly inject Angular Router

  allCars: any[] = [];
  userData: any;

  ngOnInit() {
    this.userData = this.dataservice.getIdForNavig();
    this.dataservice.allCars().subscribe({
      next: (res: any) => {
        this.allCars = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}