import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DataService } from '../data.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, RouterLink],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataservice = inject(DataService);
  
  carList: any[] = [];
  trackByCarId(index: number, car: any) {
  return car.car_id; 
}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    const name = this.route.snapshot.paramMap.get("name");

    if (id && name) {
      this.dataservice.getCars(id, name).subscribe({
        next: (data: any) => {
          this.carList = data;
        },
        error: (err) => {
          console.error('Error fetching cars:', err);
        }
      });
    } else {
      console.warn("Missing route parameters: id or name");
    }
  }
}
