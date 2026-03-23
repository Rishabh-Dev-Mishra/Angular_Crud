import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthServiceService } from '../auth-service.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';

  private dataservice = inject(DataService);  
  private authService = inject(AuthServiceService)
  private router = inject(Router);  
  private toast = inject(ToastrService)

  login(){

    if (!this.email || !this.password || !this.email.includes('@')) {
    this.toast.warning('Please fix the errors before logging in', 'Form Invalid');
    return;
  }

    const user = {
      email: this.email,
      password: this.password
    };

    this.dataservice.login(user).subscribe({
      next: (res: any)=>{
        this.message = res.message;
        this.toast.success(res.message || "Login Success");
        console.log(res);
        this.authService.login("LoggedIn")
        this.router.navigate(['/home']);
      },
      error:(err:any)=> {
        if (err.status === 401 ) {
        this.toast.error("Invalid email or password")
      } else if (err.status === 400) {
        this.toast.error("User Not Registered");
      } else {
        this.toast.error("An unexpected error occurred");
      }
        this.message = err.error?.message || "Login failed";
      },
    })
  }

}
