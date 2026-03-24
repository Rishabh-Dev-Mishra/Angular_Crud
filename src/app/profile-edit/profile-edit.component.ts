import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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
export class ProfileEditComponent {
  message = '';
  showPasswordFields: boolean = false;
  
  // Image properties
  imageUrl: string = 'https://media.newyorker.com/photos/59095bb86552fa0be682d9d0/master/pass/Monkey-Selfie.jpg'; 
  selectedFile: File | null = null;

  private router = inject(Router);
  private toast = inject(ToastrService);
  private dataservice = inject(DataService);

  // Triggered when user selects a file
  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];

      // // Local preview logic
      // const reader = new FileReader();
      // reader.onload = (e: any) => this.imageUrl = e.target.result;
      // reader.readAsDataURL(this.selectedFile);
    }
  }

  editform(form: any) {
    if (form.invalid) {
      this.toast.warning('Please fix the errors before submitting', 'Form Invalid');
      return;
    }

    // Use FormData because we are sending a file (Multipart/form-data)
    const formData = new FormData();
    formData.append('firstname', form.value.firstname);
    formData.append('lastname', form.value.lastname);
    formData.append('email', form.value.email);
    
    if (this.showPasswordFields) {
      formData.append('currentpassword', form.value.currentpassword);
      formData.append('newpassword', form.value.newpassword);
    }

    // Append the image file if one was selected
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    // Pass the formData object to your service
    this.dataservice.edit(formData).subscribe({
      next: (res: any) => {
        this.toast.success("Profile Updated Successfully");
        this.router.navigate(["/"]);
      },
      error: (err: any) => {
        this.message = err.error?.message || 'An error occurred';
        this.toast.error(this.message);
      }
    });
  }
}
