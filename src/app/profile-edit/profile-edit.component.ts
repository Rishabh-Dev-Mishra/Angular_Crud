import { Component, inject, OnInit } from '@angular/core';
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
  private router = inject(Router);
  private toast = inject(ToastrService);
  private dataservice = inject(DataService);
  
  showPasswordFields: boolean = false;
  readonly serverUrl = 'http://localhost:3000/'; 

  // --- NEW PROPERTIES FOR IMAGE ---
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Updated Getter: Prioritizes the local preview, then the saved path
  get imageURL(): string {
    if (this.previewUrl) return this.previewUrl;
    const path = this.dataservice.img_path || sessionStorage.getItem('userImage'); 
    return path && (path.length > 0) ? `${this.serverUrl}uploads/${path}` : '';
  }

  // --- NEW METHOD: CAPTURE THE FILE ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create a local preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  editform(form: any) {
    if (form.invalid) {
      this.toast.warning('Please fix the errors before submitting', 'Form Invalid');
      return;
    }

    // --- SWITCH TO FORMDATA ---
    const formData = new FormData();
    
    // Append text fields from the form
    formData.append('firstname', form.value.firstname || '');
    formData.append('lastname', form.value.lastname || '');
    formData.append('email', form.value.email);

    // Append the image file ONLY if one was selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile); 
    }

    this.dataservice.edit(formData).subscribe({
      next: (res: any) => {
        this.toast.success("Profile Updated Successfully");
        
        // Update local storage if backend returns the NEW image filename
        if (res.img_pth) {
          this.dataservice.setProfileImage(res.img_pth);
        }
        
        this.router.navigate(["/home"]);
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'An error occurred');
      }
    });
  }
}
