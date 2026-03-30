import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-brands',
  imports: [NavbarComponent,CommonModule, FooterComponent, RouterLink],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css'
})
export class BrandsComponent {
  private dataservice = inject(DataService);
  brandList: any[] = [];

  ngOnInit(){
    this.dataservice.getBrands().subscribe({
        next:(data: any)=>{
          this.brandList = data;
        },
        error:(err)=>{
          console.log(err);
        }
    })
  }

}
