import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, FooterComponent, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private router = inject(Router)
  private dataservice= inject(DataService)

 trackByBrandId(index: number, brand: any) {
    return brand.brand_id;
  }

allCarsOfUser() {
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
    if(this.role == 'admin')return true;
    return false;
  }

  carList: any[] = [];
  getCars: boolean = false;

  allCars(){
    this.getCars = true;
    this.dataservice.getAllCars().subscribe({
      next:(res:any)=>{
        this.carList = res;
        console.log(this.carList);
        
      },
      error:(err:any)=>{
        console.log(err);
        
      }
    })

  }

  backFromCars(){
    this.getCars = false;
  }

  userList: any[] = [];
  getUsers: boolean = false;

  users(){
    this.getUsers = true;
    this.dataservice.getAllUsers().subscribe({
      next:(res:any)=>{
        this.userList = res;
      },
      error:(err:any)=>{
        console.log(err);
      }
    })
  }

  backFromUsers(){
    this.getUsers = false;
  }

  brandList: any[] = [];
  getBrands: boolean = false;

  brands(){
    this.getBrands = true;
    this.dataservice.getAllBrands().subscribe({
      next:(res:any)=>{
        this.brandList = res;
      },
      error:(err:any)=>{
        console.log(err);
      }
    })
  }

  backFromBrands(){
    this.getBrands = false;
  }


  goToBrands(){
    this.router.navigate
  }
  goToCars(){
    
  }

  updateUserRole(event: any, user_id: any) {
  const isAdmin = event.target.checked;
  const newRole = isAdmin ? 'admin' : 'user';

  this.dataservice.updateRole(user_id, newRole).subscribe({
    next: (res) => console.log('Database updated successfully'),
    error: (err) => console.error('Failed to update database', err)
  });
}

role = this.dataservice.getUserRole();
user_id = this.dataservice.getUserId();

}
