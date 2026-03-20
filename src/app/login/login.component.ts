import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-login',
  imports: [],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';

  private dataservice = inject(DataService);    

  login(){
    const user = {
      email: this.email,
      password: this.password
    };

    this.dataservice.login(user).subscribe({
      next: (res: any)=>{
        this.message = res.message;
        console.log(res);
      },
      error:(err:any)=> {
        this.message = err.error?.message || "Login failed";  
      },
    })
  }

}
