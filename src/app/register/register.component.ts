import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  firstname = '';
  lastname = '';
  email = '';
  password = '';
  message = '';

  private dataService = inject(DataService);
  private toast = inject(ToastrService);

  register(form: any) {
    this.dataService.register(form.value).subscribe({
      next: (res: any) => {
        form.resetForm();
        this.message = res.message;
        this.toast.success('Register Sucess');
      },
      error: (err: any) => {
        this.message = err.error?.message || 'An error occurred';
        this.toast.warning('Email Already Taken');
      },
    });
  }
}
