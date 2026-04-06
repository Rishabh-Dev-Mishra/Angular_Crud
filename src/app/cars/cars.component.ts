import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DataService } from '../data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css',
})
export class CarsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataservice = inject(DataService);
  private router = inject(Router);
  private toast = inject(ToastrService);

  carList: any[] = [];
  filteredCar: any[] = [];
  multiImage: string[] = [];

  trackByCarId(index: number, car: any) {
    return car.car_id;
  }

  brand_name = this.route.snapshot.paramMap.get('name') ?? '';

  allCars() {
    const id = this.route.snapshot.paramMap.get('id');
    const name = this.route.snapshot.paramMap.get('name');

    if (id && name) {
      this.dataservice.getCars(id, name).subscribe({
        next: (data: any) => {
          this.carList = data;
          this.filteredCar = data;
        },
        error: (err) => {
          console.error('Error fetching cars:', err);
        },
      });
    } else {
      console.warn('Missing route parameters: id or name');
    }
  }

  ngOnInit(): void {
    this.allCars();
  }

  searchText: string = '';
  selectedCategory: string = 'none';
  selectedEngine: string = 'none';

  combine = this.searchText + this.selectedCategory + this.selectedEngine;

  getAllCars() {
    const id: string = this.route.snapshot.paramMap.get('id') ?? '';
    const name: string =
      this.route.snapshot.paramMap.get('name') ?? 'Unknown Brand';
    this.dataservice.setIdForNavig(id, name);
    this.router.navigate(['/allcars']);
  }

  filterCars() {
    this.currentPage = 1;
    const hasSearch = this.searchText.trim().length > 0;
    const hasCategory =
      this.selectedCategory !== 'none' && this.selectedCategory !== '';
    const hasEngine =
      this.selectedEngine !== 'none' && this.selectedEngine !== '';
    if (hasSearch || hasCategory || hasEngine) {
      const term = this.searchText.trim() || 'none';
      const cat = this.selectedCategory || 'none';
      const eng = this.selectedEngine || 'none';
      const id = this.route.snapshot.paramMap.get('id') || '';
      this.dataservice.filteredCars(id, term, cat, eng).subscribe({
        next: (data: any) => {
          this.filteredCar = data;
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      this.filteredCar = this.carList;
    }
  }

  showModal: boolean = false;

  getImages(carData: any) {
    this.dataservice.getImagesOfOne(carData.car_id).subscribe({
      next: (res: any) => {
        this.multiImage = res[0].car_logo.map(
          (img: string) => `http://localhost:3000/uploads/${img}`,
        );
        this.showModal = true;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  backToAll() {
    this.showModal = false;
    this.multiImage = [];
  }

  confirmDeleteButton: boolean = false;
  selectedCar: any;

  confirmDelete(car:any) {
    this.confirmDeleteButton = true;
    this.selectedCar = car;
    
  }

  cancelDelete() {
    this.confirmDeleteButton = false;
    this.selectedCar = null;
  }
  deleteCar() {
    this.dataservice.deleteCar(this.selectedCar).subscribe({
      next: (res: any) => {
        this.toast.success('Successfully Deleted');
        this.allCars()
        this.cancelDelete();
      },
      error: (err: any) => {
        console.log(err);
        this.cancelDelete();
      },
    });
  }

  editCar(data: any) {
    const car_id = data.car_id;
    this.router.navigate(['/editCar', car_id]);
  }

  currentPage: number = 1;
  itemsPerPage: number = 2;

  get paginatedCars() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCar.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredCar.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
