import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css'
})
export class ForgotpasswordComponent {


  private dataservice= inject(DataService);

  private toast = inject(ToastrService)
  
  private router = inject(Router)
  formData = {
    email: '',
    firstname: '',
    password: '',
    confirmPassword: ''
  };

  onSubmit(form: any) {
    if (form.valid && this.isPasswordMatch()) {
      console.log('Form Data:', this.formData);
      
 
      const payload = {
        email: this.formData.email,
        firstname: this.formData.firstname,
        newPassword: this.formData.password
      };

      this.dataservice.resetPassword(this.formData).subscribe({
        next:(res: any)=>{
          this.toast.success("Password Reset");
          this.router.navigate(["/"])
        },
        error:(err: any)=>{

        }
      })

  
    } else {
      console.error('Form is invalid or passwords do not match');
    }
  }

  isPasswordMatch(): boolean {
    return this.formData.password === this.formData.confirmPassword;
  }

}
