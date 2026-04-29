import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-carforsell',
  imports: [NavbarComponent, FooterComponent,CommonModule, RouterLink],
  templateUrl: './carforsell.component.html',
  styleUrl: './carforsell.component.css'
})
export class CarforsellComponent {

  constructor (private location:Location){}
  private dataservice = inject(DataService);
  private toast = inject(ToastrService);
  private router = inject(Router)


  ngOnInit(){
    this.getCars();
  }

  carList: any[] = [];
  user_id = this.dataservice.getUserId();
  getCars(){
    this.dataservice.getSellingCars(this.user_id).subscribe({
      next:(res:any)=>{
        this.carList = res;
         console.log("API RESPONSE:", res);
      },
      error:(err:any)=>{
        console.log(err);
      }
    })
  }
  goBack(){
    this.location.back();
  }

}
