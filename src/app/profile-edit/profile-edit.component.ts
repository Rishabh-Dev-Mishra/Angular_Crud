import { Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css',
})
export class ProfileEditComponent {

  constructor(private location:Location){}
  private router = inject(Router);
  private toast = inject(ToastrService);
  private dataservice = inject(DataService);
  private route = inject(ActivatedRoute);

  showPasswordFields: boolean = false;
  readonly serverUrl = 'http://localhost:3000/';

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  user_id: any = this.route.snapshot.paramMap.get('user_id');

  
  firstname: string = '';
  lastname: string = '';
  email: string = '';
  path: string = '';
  
  getUserInfo() {
    this.dataservice.getUserInfo(this.user_id).subscribe({
      next: (res: any) => {
        this.firstname = res.firstname;
        this.lastname = res.lastname;
        this.email = res.email;
        this.path = res.image_path;
        console.log(this.path);
        
      },
      error: (err: any) => {
        this.toast.error('error in fetching info');
        console.log(err);
      }
    });
  }

  ngOnInit() {
    this.getUserInfo();
  }

  get imageURL(): string {
    if (this.previewUrl) return this.previewUrl;
    return this.path && this.path.length > 0 ? `${this.serverUrl}uploads/${this.path}` : '';
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
      this.toast.warning(
        'Please fix the errors before submitting',
        'Form Invalid',
      );
      return;
    }

    const formData = new FormData();

    formData.append('user_id', this.user_id);
    formData.append('firstname', form.value.firstname || '');
    formData.append('lastname', form.value.lastname || '');
    formData.append('email', form.value.email);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.dataservice.edit(formData).subscribe({
      next: (res: any) => {
        this.toast.success('Profile Updated Successfully');
        this.firstname = form.value.firstname
        this.lastname = form.value.lastname
        this.email = form.value.email

        if (res.img_pth) {
          this.dataservice.setProfileImage(res.img_pth);
        }
        sessionStorage.setItem('userName', res.name);
        sessionStorage.setItem('userEmail', res.email);
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'An error occurred');
      },
    });
  }
  updatePassword(form: any) {
    if (form.invalid) {
      this.toast.warning(
        'Please fix the errors before submitting',
        'Form Invalid',
      );
      return;
    }

    const payload = {
      user_id: this.user_id,
      currentpassword: form.value.currentpassword,
      newpassword: form.value.newpassword,
      confirmpassword: form.value.confirmpassword,
    };

    this.dataservice.edit(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Password Updated Successfully');
        this.showPasswordFields = false;
        form.reset();
      },
      error: (err: any) => {
        this.toast.error(err.error || err.statusText || 'Update failed');
      },
    });
  }
  goBack(){
    this.location.back();
  }
}
