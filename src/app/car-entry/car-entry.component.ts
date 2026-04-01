import { Component, inject } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-car-entry',
  imports: [FooterComponent, NavbarComponent,CommonModule, FormsModule, RouterLink],
  templateUrl: './car-entry.component.html',
  styleUrl: './car-entry.component.css'
})
export class CarEntryComponent {

  private dataservice = inject(DataService);
  private toast = inject(ToastrService);

  availableBrands: any[] = [];

  selectedFile: File | null = null;

  ngOnInit(){
    this.dataservice.getBrandsForEntry().subscribe({
      next: (data: any) => {
        this.availableBrands = data;
      },
      error: (err) => {
        console.error('Error fetching all brands:', err);
      }
    });
  }

  onFileSelected(event: any){
    const file = event.target.files[0];
    if (file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      alert("Only .png, .jpg and .jpeg format allowed!");
      event.target.value = ''; 
      return;
    }
      this.selectedFile = file;
    }
  }

  update(form: any){
    if(form.invalid){
      this.toast.warning('Fix the errors before proceeding');
      return;
    }

    if(this.selectedFile==null){
      this.toast.warning('Upload image');
      return;
    }
   
    const formData = new FormData();
    formData.append('brandName', form.value.brandName);
    formData.append('modelName', form.value.modelName);
    formData.append('category', form.value.category);
    formData.append('engineType', form.value.engineType);
    formData.append('horsePower', form.value.horsePower);
    formData.append('torque', form.value.torque);
    formData.append('topSpeed', form.value.topSpeed);
    formData.append('price', form.value.price);
    formData.append('description', form.value.description);
    if(this.selectedFile){
      formData.append('image', this.selectedFile);
    }
    this.dataservice.addCar(formData).subscribe({
      next: (res: any)=>{
        this.toast.success("Added Success")
        form.resetForm();
      },
      error:(err: any)=>{
        this.toast.error("Wrong!!")
        console.log(err);
      }
    })
  }
}
