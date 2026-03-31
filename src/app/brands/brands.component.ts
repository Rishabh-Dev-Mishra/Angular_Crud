import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, FooterComponent, RouterLink],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css'
})
export class BrandsComponent implements OnInit {
  private dataservice = inject(DataService);
  
  brandList: any[] = [];
  filteredBrands: any[] = [];
  searchQuery: string = '';

  ngOnInit() {
    this.allBrands();
  }

  allBrands() {
    this.dataservice.getBrands().subscribe({
      next: (data: any) => {
        this.brandList = data;
        this.filteredBrands = data; 
      },
      error: (err) => {
        console.error('Error fetching all brands:', err);
      }
    });
  }

filterBrands() {
  const query = this.searchQuery.trim();

  if (query.length > 0) {
    this.dataservice.filteredBrands(query).subscribe({
      
      next: (data: any) => {
        console.log("get data");
        this.filteredBrands = data; 
      },
      error: (err) => {
        console.error('Search failed', err);
        this.filteredBrands = [];
      }
    });
  } else {
    this.filteredBrands = this.brandList;
  }
}
}