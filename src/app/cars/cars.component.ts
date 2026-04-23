import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DataService } from '../data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css',
})
export class CarsComponent implements OnInit {
  constructor (private location:Location){}
  private route = inject(ActivatedRoute);
  private dataservice = inject(DataService);
  private router = inject(Router);
  private toast = inject(ToastrService);

  backendUrl = environment.apiUrl

  carList: any[] = [];
  filteredCar: any[] = [];
  multiImage: string[] = [];

  userIdFromURL: any = this.route.snapshot.paramMap.get("id")

  trackByCarId(index: number, car: any) {
    return car.car_id;
  }

  brand_name = this.route.snapshot.paramMap.get('name') ?? '';
  goBack(){
    this.location.back()
  }

  allCars() {
    const id = this.route.snapshot.paramMap.get('id');
    const name = this.route.snapshot.paramMap.get('name');

    if (id && name) {
      const pageToOffset = (this.currentPage-1)*this.itemsPerPage; 
      this.dataservice.getCars(id, name, this.itemsPerPage, pageToOffset).subscribe({
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

  carsPerBrand() {
    const id = this.route.snapshot.paramMap.get('id');
    const name = this.route.snapshot.paramMap.get('name');

    if (id && name) {
      this.dataservice.getCarsPerBrand(id, name).subscribe({
        next: (data: any) => {
          this.filteredCar = data;
          this.calculatePages();
          this.filteredCar = [];
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
    this.carsPerBrand()
    this.allCars();
  }

  searchText: string = '';
  selectedCategory: string = 'none';
  selectedEngine: string = 'none';

  combine = this.searchText + this.selectedCategory + this.selectedEngine;

  getAllCars() {
    const id: string = this.route.snapshot.paramMap.get('id') ?? '';
    const user_id : string = this.route.snapshot.paramMap.get('user_id')?? '';
    const name: string =
      this.route.snapshot.paramMap.get('name') ?? 'Unknown Brand';
    this.dataservice.setIdForNavig(id, name);
    this.router.navigate(['/allcars', user_id]);
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
          this.calculatePages();
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
          (img: string) => `${img}`,
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
  confirmDelete(car: any) {
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
        this.cancelDelete();
        this.calculatePages();
        this.allCars();
      },
      error: (err: any) => {
        console.log(err);
        this.cancelDelete();
      },
    });
  }

  confirmDeleteButton: boolean = false;
  selectedCar: any;


  editCar(data: any) {
    const car_id = data.car_id;
    this.router.navigate(['/editCar', car_id]);
  }

  currentPage: number = 1;
  itemsPerPage: number = 2;
  totalPages: any = 0;

  calculatePages() {
    this.totalPages = Math.ceil(this.filteredCar.length / this.itemsPerPage);
  }

  decreasePage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.allCars();
    }
  }

  increasePage() {
    if (this.currentPage <= this.totalPages - 1) {
      this.currentPage += 1;
      this.allCars();
    }
  }
}
