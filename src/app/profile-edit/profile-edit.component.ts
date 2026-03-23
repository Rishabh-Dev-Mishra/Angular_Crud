import { Component, OnInit, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule} from "@angular/forms";
import { DataService } from '../data.service';

@Component({
  selector: 'app-profile-edit',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css'
})
export class ProfileEditComponent{
  message = '';

  private toast = inject(ToastrService);
  private dataservice = inject(DataService)

  editform(form: any){
    if(form.invalid){
      this.toast.warning('Please fix the errors before logging in', 'Form Invalid');
    return;
    }
    this.dataservice.edit(form.value).subscribe({
      next: (res: any) => {this.message = res.message
        this.toast.success("Register Sucess")
      },
      error: (err: any) => {this.message = err.error?.message || 'An error occurred'
        this.toast.warning("Invalid details")
      }
    })
  }
}
