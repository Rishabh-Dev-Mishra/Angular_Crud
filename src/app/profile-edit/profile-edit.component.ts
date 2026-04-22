import { Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Location } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, filter, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  readonly serverUrl = environment.apiUrl;


  selectedFile: File | null = null;
  previewUrl: string | null = null;
  user_id: any = this.route.snapshot.paramMap.get('user_id');
  
  loggedUser: any = this.dataservice.getUserId();
  
  
  firstname: string = '';
  lastname: string = '';
  email: string = '';
  path: string = '';
  user:any;
  
  emailControl = new FormControl('', [Validators.required, Validators.email, Validators.pattern('^(.+)@\\1\\.[a-zA-Z]{2,}$')]);
  emailExsitsError: boolean = false;


  getUserInfo() {
    this.dataservice.getUserInfo(this.user_id).subscribe({
      next: (res: any) => {
        this.firstname = res.firstname;
        this.lastname = res.lastname;
        this.email = res.email;        
        this.path = res.image_path;
        this.user = res;
        this.emailControl.patchValue(this.email, {emitEvent: false});
        if(this.path != null){
          this.showRemoveButton = true;
        }
        else{
          this.showRemoveButton=false;
        }
        console.log("image path",this.path);
        console.log("Inside the UserInfo");
        
      },
      error: (err: any) => {
        this.toast.error('error in fetching info');
        console.log(err);
      }
    });
  }



  ngOnInit() {
    this.getUserInfo();
    this.emailControl.valueChanges.pipe(
      tap(() => this.emailExsitsError = false), 
      debounceTime(400),
      distinctUntilChanged(),
      filter(()=>this.emailControl.valid),
      switchMap(email=> this.dataservice.checkMail(email || "", this.user_id))
    ).subscribe({
      next:(res: any)=>{
        console.log(res);
        
        if(res.length > 0)
        this.emailExsitsError = true;
        else this.emailExsitsError = false;

        console.log("Inside the INIT");
        
      },
      error:(err: any)=>{
        console.log(err);
      }
    })
  }

  get imageURL(): string {
    return this.previewUrl || this.path || '';

  }

  deleteImage(){
    this.dataservice.removeImage(this.user_id).subscribe({
      next:(res:any)=>{
      this.path = '';
      this.previewUrl = null;
      this.selectedFile = null;

      this.user.image_path = null;

      sessionStorage.setItem('userImage', '');

      this.showRemoveButton = false;

      this.toast.success("Image removed");
      console.log("Inside the delete image");

      this.showRemoveButton=false;
      },
      error:(err:any)=>{
        this.toast.error(err.message);
      }
    })
  }

  showRemoveButton: boolean = false;


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      this.showRemoveButton=true;
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
    formData.append('email', this.emailControl.value || '');
    console.log(formData.get('email'));
    

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    
    this.dataservice.edit(formData).subscribe({
      next: (res: any) => {
        console.log("Inside the edit form");
        this.getUserInfo();
        this.toast.success('Profile Updated Successfully');
        this.firstname = form.value.firstname
        this.lastname = form.value.lastname
        this.email = form.value.email
        
        form.reset();
        if (res.img_pth) {
          this.dataservice.setProfileImage(res.img_pth);
        }
        sessionStorage.setItem('userName', res.name);
        sessionStorage.setItem('userEmail', res.email);
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

  updateUserRole(event: any, user_id: any) {
    const isAdmin = event.target.checked;
    const newRole = isAdmin ? 'admin' : 'user';

    this.dataservice.updateRole(user_id, newRole).subscribe({
      next: (res) => console.log('Database updated successfully'),
      error: (err) => console.error('Failed to update database', err),
    });
  }
}
