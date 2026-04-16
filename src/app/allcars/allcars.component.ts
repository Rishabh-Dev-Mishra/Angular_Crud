import { Component, inject, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule, Location } from '@angular/common';
import { DataService } from '../data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-allcars',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, CommonModule, RouterLink],
  templateUrl: './allcars.component.html',
  styleUrl: './allcars.component.css',
})
export class AllCarsComponent implements OnInit {
  constructor(private location: Location) {}
  private route = inject(ActivatedRoute);
  private dataservice = inject(DataService);
  private router = inject(Router);
  private toast = inject(ToastrService)

  allCars: any[] = [];
  userData: any;

  showModal: boolean = false;
  multiImage: string[] = [];

  user_id = this.route.snapshot.paramMap.get('user_id') ?? ' ';
  loggedUser_id = this.dataservice.getUserId() ?? ' ';
  goBack() {
    this.location.back();
  }

  getAllCars() {
    console.log(this.user_id);

    this.dataservice.allCars(this.user_id).subscribe({
      next: (res: any) => {
        this.allCars = res;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  ngOnInit() {
    this.getAllCars();
  }

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
        this.getAllCars();
      },
      error: (err: any) => {
        console.log(err);
        this.cancelDelete();
      },
    });
  }
  selectedCar: any;
}
