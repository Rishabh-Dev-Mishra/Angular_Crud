import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms'; // 1. Must import this for [(ngModel)]

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule], // 2. Add it to the imports array
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

  register() {
    const user = { firstname: this.firstname, password: this.password, lastname: this.lastname, email: this.email };
    
    this.dataService.register(user).subscribe({
      next: (res: any) => this.message = res.message,
      error: (err: any) => this.message = err.error?.message || 'An error occurred'
    });
  }
}
