import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstname = '';
  lastname = '';
  email = '';
  password = '';
  message = '';

  private dataService = inject(DataService);
  private toast = inject(ToastrService)

  register() {
    const user = { firstname: this.firstname, password: this.password, lastname: this.lastname, email: this.email };
    
    this.dataService.register(user).subscribe({
      next: (res: any) => {this.message = res.message
        this.toast.success("Register Sucess")
      },
      error: (err: any) => {this.message = err.error?.message || 'An error occurred'
        this.toast.warning("Invalid details")
      }
    });
  }
}
