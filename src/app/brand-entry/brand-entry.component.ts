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
  imports: [FormsModule , RouterLink, FooterComponent, NavbarComponent],
  templateUrl: './brand-entry.component.html',
  styleUrl: './brand-entry.component.css'
})
export class BrandEntryComponent {
  private dataservice = inject(DataService);
  
  private toast = inject(ToastrService)

  private brandName:string = '';
  
  update(form :any){
    const newBrand = {
    brandName : form.value.brandName,
  }
    this.dataservice.addBrand(newBrand).subscribe({
      next: (res:any)=>{
        this.toast.success("Added Successfully")
      },
      error: (err:any)=>{
        this.toast.error("Wrong!!");
        console.log(err);
      }
    })
  }
}
