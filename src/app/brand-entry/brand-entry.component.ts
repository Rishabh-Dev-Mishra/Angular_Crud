import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

@Component({
  selector: 'app-brand-entry',
  standalone: true,
  imports: [FormsModule, FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './brand-entry.component.html',
  styleUrl: './brand-entry.component.css'
})
export class BrandEntryComponent {

  constructor(private location : Location){}

  
  private dataservice = inject(DataService);
  
  private toast = inject(ToastrService)

  selectedFile: File | null = null;

  private brandName:string = '';

  onFileSelected(event:any){
    const file = event.target.files[0];
    if(file){
      this.selectedFile = file;
    }
  }


  goBack(){
    this.location.back();
  }

  showmssg: boolean = true;

  
  disableButton(){
    this.showmssg = false;
  }
  
  update(form :any){
        this.showmssg = false;

    if (form.invalid) {
      this.toast.warning('Please fix the errors before submitting', 'Form Invalid');
      return;
    }

    const formData = new FormData();

    formData.append('brandName', form.value.brandName);

    if(this.selectedFile){
      formData.append('image', this.selectedFile);
    }

    
    this.dataservice.addBrand(formData).subscribe({
      next: (res:any)=>{
        this.toast.success("Added Successfully")
        form.resetForm();
        this.showmssg = true;

      },
      error: (err:any)=>{
        this.showmssg = true;

        this.toast.error("Wrong!!");
        console.log(err);
      }
    })
  }
}
