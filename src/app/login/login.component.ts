import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';

  private dataservice = inject(DataService);  
  private router = inject(Router);  
  private toast = inject(ToastrService)

  login(){
    const user = {
      email: this.email,
      password: this.password
    };

    this.dataservice.login(user).subscribe({
      next: (res: any)=>{
        this.message = res.message;
        this.toast.success(res.message || "Login Success");
        console.log(res);
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
