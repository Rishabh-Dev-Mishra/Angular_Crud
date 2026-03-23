import { Component, OnInit, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-profile-edit',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css'
})
export class ProfileEditComponent{

  private toast = inject(ToastrService);

  editform(form: any){
    if(form.invalid){
      this.toast.warning('Please fix the errors before logging in', 'Form Invalid');
    return;
    }
  }
}
