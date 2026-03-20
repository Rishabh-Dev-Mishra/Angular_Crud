import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
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
