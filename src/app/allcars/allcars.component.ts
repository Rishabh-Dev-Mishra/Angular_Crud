import { Component, inject, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule,Location } from '@angular/common';
import { DataService } from '../data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-allcars',
  standalone: true, 
  imports: [FooterComponent, NavbarComponent, CommonModule, RouterLink],
  templateUrl: './allcars.component.html',
  styleUrl: './allcars.component.css'
})
export class AllCarsComponent implements OnInit {

  constructor (private location: Location){}
  private route = inject(ActivatedRoute);
  private dataservice = inject(DataService);
  private router = inject(Router); 

  allCars: any[] = [];
  userData: any;

  showModal:boolean = false;
  multiImage: string[] = [];

  user_id:string = this.dataservice.getUserId()??"";

  goBack(){
    this.location.back();
  }

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

  getImages(carData: any){
  this.dataservice.getImagesOfOne(carData.car_id).subscribe({
    next:(res: any)=>{
      this.multiImage = res[0].car_logo.map((img:string)=>
        `http://localhost:3000/uploads/${img}`
      )
      this.showModal = true;
    },
    error:(err:any)=>{
      console.log(err);
      
    }
  })
  }

  backToAll(){
    this.showModal = false;
    this.multiImage = [];
  }

  
}