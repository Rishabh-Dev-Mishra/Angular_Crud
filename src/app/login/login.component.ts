import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthServiceService } from '../auth-service.service';
import { StatusserviceService } from '../statusservice.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  email = '';
  password = '';
  message = '';

  private dataservice = inject(DataService); 
  private statusservice = inject(StatusserviceService) 
  private authService = inject(AuthServiceService)
  private router = inject(Router);  
  private toast = inject(ToastrService)

  ngOnInit() {
    this.authService.logout();
  }

  login(form: any){

    if (form.invalid) {
    this.toast.warning('Please fix the errors before logging in', 'Form Invalid');
    return;
  }

    const user = {
      email: form.value.email,
      password: form.value.password
    };

    this.dataservice.login(user).subscribe({
      next: (res: any)=>{
        this.message = res.message;
        this.toast.success(res.message || "Login Success");
        console.log(res);
        this.authService.saveToken(res.token);
        this.dataservice.setInfo(res.name, res.email, res.user_id, res.role)
        if (res.img_pth.length > 0) { 
          this.dataservice.setProfileImage(res.img_pth);
        }
        else{
          this.dataservice.setProfileImage('')
        }
        this.statusservice.startPolling();
        this.router.navigate(['/home']);
      },
      error:(err:any)=> {
        const backendMessage = typeof err.error === 'string' 
    ? err.error 
    : (err.error?.message || "An unexpected error occurred");
        this.toast.error(backendMessage);
      },
    })
  }
}