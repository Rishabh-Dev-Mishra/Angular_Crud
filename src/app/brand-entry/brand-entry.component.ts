import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-brand-entry',
  standalone: true,
  imports: [FormsModule, FooterComponent, NavbarComponent],
  templateUrl: './brand-entry.component.html',
  styleUrl: './brand-entry.component.css'
})
export class BrandEntryComponent {

  
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
  
  update(form :any){
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
      },
      error: (err:any)=>{
        this.toast.error("Wrong!!");
        console.log(err);
      }
    })
  }
}
