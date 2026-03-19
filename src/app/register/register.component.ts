import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms'; // 1. Must import this for [(ngModel)]

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule], // 2. Add it to the imports array
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  password = '';
  message = '';

  private dataService = inject(DataService);

  register() {
    const user = { username: this.username, password: this.password };
    
    this.dataService.register(user).subscribe({
      next: (res: any) => this.message = res.message,
      error: (err: any) => this.message = err.error?.message || 'An error occurred'
    });
  }
}
