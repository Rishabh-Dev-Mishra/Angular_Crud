import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule} from "@angular/forms";
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css'
})
export class ProfileEditComponent{
  message = '';
  showPasswordFields:boolean=false;
  constructor(private router: Router) {}
  private toast = inject(ToastrService);
  private dataservice = inject(DataService)

  editform(form: any){
    if(form.invalid){
      this.toast.warning('Please fix the errors before logging in', 'Form Invalid');
    return;
    }
    this.dataservice.edit(form.value).subscribe({
      next: (res: any) => {this.message = res.message
        this.toast.success("change Sucess")
        this.router.navigate(["/"]);
      },
      error: (err: any) => {this.message = err.error?.message || 'An error occurred'
        this.toast.warning("Invalid details")
      }
    })
  }
}
