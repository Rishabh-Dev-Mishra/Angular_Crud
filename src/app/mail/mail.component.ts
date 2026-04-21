import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mail.component.html',
  styleUrl: './mail.component.css'
})
export class MailComponent {

  private dataservice = inject(DataService);
  private toast = inject (ToastrService);
  private router = inject(Router)

  formData = {
    email: '', 
    data: 'new user'
  };

  
  user: any[] = [];
  
  showmssg: boolean = true;

  
  disableButton(){
    this.showmssg = false;
  }

  onSubmit(form: any){
    this.showmssg = false
    this.formData.email = form.value.email;
    console.log("Sending email");
    
    this.dataservice.sendMail(this.formData).subscribe({
      next:(res:any)=>{
        this.toast.success("Please check mail for resetting")
        form.resetForm();
        this.showmssg = true;
        this.router.navigate(["/"])
      },
      error:(err:any)=>{
        const backendMessage = err.error?.message || "An unexpected error occurred";
        this.toast.error(backendMessage);
               form.resetForm();
                this.showmssg = true;

        console.log(err)
      }
    })
  }

}
