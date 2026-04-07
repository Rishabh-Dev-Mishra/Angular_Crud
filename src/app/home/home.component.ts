import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private router = inject(Router)
  private dataservice= inject(DataService)

 trackByBrandId(index: number, brand: any) {
    return brand.brand_id;
  }

allCars() {
  const user_id = sessionStorage.getItem("user_id");
  if (user_id) {
    this.router.navigate(['/allcars']); 
  } else {
    console.log("error");
    
  }
}


checkUser(){
    const name = sessionStorage.getItem('userName');
    const email = sessionStorage.getItem('userEmail');
    if(name == "Rishabh" && email == 'rd@rd.com')return true;
    return false;
  }

  users(){


  }

  brandList: any[] = [];
  getBrands: boolean = false;

  brands(){
    this.getBrands = true;
    this.dataservice.getAllBrands().subscribe({
      next:(res:any)=>{
        this.brandList = res;
        console.log('Brands Loaded:', this.brandList);
      },
      error:(err:any)=>{
        console.log(err);
      }
    })
  }

  backFromBrands(){
    this.getBrands = false;
  }

}
