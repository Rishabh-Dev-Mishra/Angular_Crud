import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule,
    FooterComponent,
    RouterLink,
  ],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
})
export class BrandsComponent implements OnInit {
  constructor(private location: Location) {}
  private dataservice = inject(DataService);
  private route = inject(ActivatedRoute);

  backendUrl = environment.apiUrl

  brandList: any[] = [];
  filteredBrands: any[] = [];
  searchQuery: string = '';

  ngOnInit() {
    this.allBrands();
  }
  user_id = this.route.snapshot.paramMap.get('id');
  allBrands() {
    this.dataservice.getBrands(this.user_id).subscribe({
      next: (data: any) => {
        this.brandList = data;
        this.filteredBrands = data;
      },
      error: (err) => {
        console.error('Error fetching all brands:', err);
      },
    });
  }

  filterBrands() {
    const query = this.searchQuery.trim();

    if (query.length > 0) {
      this.dataservice.filteredBrands(query).subscribe({
        next: (data: any) => {
          console.log('get data');
          this.filteredBrands = data;
        },
        error: (err) => {
          console.error('Search failed', err);
          this.filteredBrands = [];
        },
      });
    } else {
      this.filteredBrands = this.brandList;
    }
  }

  goBack() {
    this.location.back();
  }
}
