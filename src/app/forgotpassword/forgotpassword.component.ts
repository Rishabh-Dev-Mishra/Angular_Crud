import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css'
})
export class ForgotpasswordComponent {

  private dataservice= inject(DataService);

  private toast = inject(ToastrService)
  
  private router = inject(Router)

  private route = inject(ActivatedRoute)

  token = this.route.snapshot.paramMap.get("token");
  id = this.route.snapshot.paramMap.get("id")

  ngOnInit(){
    this.dataservice.validateToken(this.token, this.id).subscribe({
      next:(res:any)=>{
        if(!res.valid) this.router.navigate(["/"]);
      },
      error:(err:any)=>{
        this.router.navigate(["/"]);
        this.toast.warning("You are on Wrong address")
        return;
      }
    })
  }


  formData = {
    password: '',
    confirmPassword: ''
  };

  onSubmit(form: any) {
    if (form.valid && this.isPasswordMatch()) {
      console.log('Form Data:', this.formData);
      
 
      const payload = {
        newPassword: this.formData.password
      };
      const token_number = this.route.snapshot.paramMap.get("id")
      this.dataservice.resetPassword(this.formData, token_number).subscribe({
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
