import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  login(){
    const user = {
      email: this.email,
      password: this.password
    };

    this.dataservice.login(user).subscribe({
      next: (res: any)=>{
        this.message = res.message;
        console.log(res);
        this.router.navigate(['/home']);
      },
      error:(err:any)=> {
        if (err.status === 401 ) {
        alert("Invalid email or password");
      } else if (err.status === 400) {
        alert("User Not Registered");
      } else {
        alert("An unexpected error occurred");
      }
        this.message = err.error?.message || "Login failed";
      },
    })
  }

}
