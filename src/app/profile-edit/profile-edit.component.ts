import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-profile-edit',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css'
})
export class ProfileEditComponent implements OnInit{
  userForm!: FormGroup;
  constructor(private fb: FormBuilder){}

  ngOnInit(){
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', Validators.required, Validators.email],
      role: ['subscriber']

    })
  }
  onSubmit(){
    if(this.userForm.valid){
      console.log(this.userForm.value)
    }
  }
}
