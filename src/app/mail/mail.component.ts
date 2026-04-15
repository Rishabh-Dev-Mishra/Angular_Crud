import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

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

  formData = {
    email: '', 
    data: 'new user'
  };

  showmssg: boolean = false;
  ngOnInit(){
    this.showmssg = false;
  }

  onSubmit(form: any){
    this.formData.email = form.value.email;
    console.log("Sending ema");
    
    this.dataservice.sendMail(this.formData).subscribe({
      next:(res:any)=>{
        this.toast.success("Please check mail for resetting")
        form.reset();
        this.showmssg = true;
      },
      error:(err:any)=>{
        this.toast.error("Enter Your mail again");
        console.log(err)
      }
    })
  }

}
