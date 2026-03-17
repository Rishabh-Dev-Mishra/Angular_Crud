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
    
    this.dataService.postUserData(user).subscribe({
      // 3. Fixed the typo: 'error' instead of 'eror'
      // 4. Fixed the syntax: 'err.error' instead of 'err: error'
      next: (res: any) => this.message = res.message,
      error: (err: any) => this.message = err.error?.message || 'An error occurred'
    });
  }
}
