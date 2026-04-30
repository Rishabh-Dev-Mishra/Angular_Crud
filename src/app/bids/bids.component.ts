import { Component, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { DataService } from '../data.service';
import { CommonModule, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-bids',
  imports: [NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './bids.component.html',
  styleUrl: './bids.component.css'
})
export class BidsComponent {

  constructor(private location: Location){}
  private dataservice = inject(DataService);
  private toast = inject(ToastrService);
  private router = inject(Router)

  goBack(){
    this.location.back();
  }

  ngOnInit(){
    this.getbids();
  }

  carList: any[] = [];
  getbids(){
    this.dataservice.allBids().subscribe({
      next:(res:any)=>{
        this.carList = res;
      },
      error:(err:any)=>{
        console.log(err);
      }
    })
  }

  goToChats(car: any){
    const buyer_id = this.dataservice.getUserId();
    console.log("Buyer Id",buyer_id);
    console.log("Seller Id", car.user_id)
    
    const payload = {
      carId: car.car_id,
      sellerId: car.user_id,
      buyerId: buyer_id
    }
    console.log(payload);
    
    this.dataservice.getRoomId(payload).subscribe({
      next:(res:any)=>{
        this.router.navigate(["/chats", res[0].id])
      },
      error:(err: any)=>{
        this.toast.show(err.error);
        console.log("Error",err);
      }
    })
   
  }
}