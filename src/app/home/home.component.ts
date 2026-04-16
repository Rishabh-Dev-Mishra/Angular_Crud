import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, FooterComponent, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private router = inject(Router);
  private dataservice = inject(DataService);
  private toast = inject(ToastrService);

  activeTab: 'users' | 'cars' | 'brands' = 'users';

  trackByBrandId(index: number, brand: any) {
    return brand.brand_id;
  }

  role: string | null = '';

  ngOnInit() {
    this.getRequests();
    this.role = this.dataservice.getUserRole();
    if (this.checkUser()) {
      this.switchTab('users');
    } else {
      this.switchTab('cars');
    }
  }

  switchTab(tab: 'users' | 'cars' | 'brands') {
    this.activeTab = tab;
    if (tab == 'users') {
      this.users();
    }
    if (tab == 'cars' && this.role == 'admin') this.allCars();
    else if (tab == 'cars' && this.role == 'user') this.homeCarsOfUser();
    if (tab == 'brands') this.brands();
  }



homeCarsOfUser(){
  const user_id = sessionStorage.getItem('user_id');
  this.dataservice.allCars(user_id).subscribe({
      next: (res: any) => {
        this.carList = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
}



  allCarsOfUser() {
    const user_id = sessionStorage.getItem('user_id');
    if (user_id) {
      this.router.navigate(['/allcars', user_id]);
    } else {
      console.log('error');
    }
  }

  checkUser() {
    const name = sessionStorage.getItem('userName');
    const email = sessionStorage.getItem('userEmail');
    if (this.role == 'admin') return true;
    return false;
  }

  carList: any[] = [];
  getCars: boolean = false;

  allCars() {
    this.getCars = true;
    this.dataservice.getAllCars().subscribe({
      next: (res: any) => {
        this.carList = res;
        console.log(this.carList);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  backFromCars() {
    this.getCars = false;
  }

  userList: any[] = [];
  getUsers: boolean = false;

  users() {
    this.getUsers = true;
    this.dataservice.getAllUsers().subscribe({
      next: (res: any) => {
        this.userList = res;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  backFromUsers() {
    this.getUsers = false;
  }

  brandList: any[] = [];
  getBrands: boolean = false;

  brands() {
    this.getBrands = true;
    this.dataservice.getAllBrands().subscribe({
      next: (res: any) => {
        this.brandList = res;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  backFromBrands() {
    this.getBrands = false;
  }

  goToBrands() {
    this.router.navigate(['/brands', this.user_id]);
  }

  updateUserRole(event: any, user_id: any) {
    const isAdmin = event.target.checked;
    const newRole = isAdmin ? 'admin' : 'user';

    this.dataservice.updateRole(user_id, newRole).subscribe({
      next: (res) => console.log('Database updated successfully'),
      error: (err) => console.error('Failed to update database', err),
    });
  }

  user_id = this.dataservice.getUserId();

  suspendUser(user_id: any) {
    const keep = 'inactive';
    const payload = {
      user_id: user_id,
      Update: keep,
    };
    this.dataservice.updateuserStatus(payload).subscribe({
      next: (res: any) => {
        this.users();
        this.toast.success('Changed the status');
      },
      error: (err: any) => {
        console.log(err);
        this.toast.error(err);
      },
    });
  }

   activateUser(user_id: any) {
    const keep = 'active';
    const payload = {
      user_id: user_id,
      Update: keep,
    };
    this.dataservice.updateuserStatus(payload).subscribe({
      next: (res: any) => {
        this.users();
        this.toast.success('Changed the status');
      },
      error: (err: any) => {
        console.log(err);
        this.toast.error(err);
      },
    });
  }

  editUser(user_id: any) {
    if (this.role != 'admin') {
      this.toast.warning('You are not authorized to do so');
      return;
    }
    this.router.navigate(['/edit-profile', user_id]);
  }

  confirmDeleteButton: boolean = false;
  selectedUser: any;

  confirmDelete(user: any) {
    this.confirmDeleteButton = true;
    this.selectedUser = user;
  }

  cancelDelete() {
    this.confirmDeleteButton = false;
    this.selectedUser = null;
  }
  deleteUser() {
    this.dataservice.deleteUser(this.selectedUser.id).subscribe({
      next: (res: any) => {
        this.users();
        this.toast.success('Deletion Success');
      },
      error: (err: any) => {
        this.toast.error(err);
      },
    });
  }

  requests: any[] = [];
  showRequests: boolean = false;
  showRequestIcon: boolean = false;

  getRequests() {
    this.dataservice.getRequests().subscribe({
      next: (res: any) => {
        this.requests = res;
        if (this.requests.length > 0) this.showRequestIcon = true;
        else {
          this.showRequestIcon = false;
          this.showRequests = false;
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  showNotification() {
    this.showRequests = true;
    this.showRequestIcon = false;
  }

  backFromRequests() {
    this.showRequests = false;
    if (this.requests.length > 0) this.showRequestIcon = true;
  }

  acceptRequest(request: any) {
    this.dataservice.acceptRequest(request).subscribe({
      next: (res: any) => {
        this.toast.success('Accepted');
        this.getRequests();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  rejectRequest(request: any) {
    this.dataservice.rejectRequest(request).subscribe({
      next: (res: any) => {
        this.toast.warning('Rejected');
        this.getRequests();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
}
