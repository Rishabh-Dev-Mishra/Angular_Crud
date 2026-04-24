import { Component, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bids',
  imports: [NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './bids.component.html',
  styleUrl: './bids.component.css'
})
export class BidsComponent {
  private dataservice = inject(DataService);
  private toast = inject(ToastrService);


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
}
