import { Component, inject } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-car-entry',
  imports: [
    FooterComponent,
    NavbarComponent,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './car-entry.component.html',
  styleUrl: './car-entry.component.css',
})
export class CarEntryComponent {
  private dataservice = inject(DataService);
  private toast = inject(ToastrService);
  private route = inject(ActivatedRoute);

  editMode: boolean = false;

  availableBrands: any[] = [];

  selectedFile: File[] = [];

  previews: string[] = [];


  car_detail = {
    brandName: '',
    modelName: '',
    category: '',
    engineType: '',
    horsePower: '',
    torque: '',
    topSpeed: '',
    price: '',
    description: '',
  };

  allCars() {
    const car_id = this.route.snapshot.paramMap.get('car_id');
    if (!car_id) {
      this.editMode = false;
      return;
    }

    this.editMode = true;
    this.dataservice.getImagesOfOne(car_id).subscribe({
      next: (res: any) => {
        this.previews = res[0].car_logo.map(
          (img: string) => `http://localhost:3000/uploads/${img}`,
        );
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.dataservice.getSingleCar(car_id).subscribe({
      next: (res: any) => {
        this.car_detail.brandName = res.brand.brand_name;
        this.car_detail.modelName = res.cars.model_name;
        this.car_detail.category = res.cars.category;
        this.car_detail.engineType = res.cars.engine_type;
        this.car_detail.horsePower = res.cars.horsepower;
        this.car_detail.torque = res.cars.torque;
        this.car_detail.topSpeed = res.cars.top_speed;
        this.car_detail.price = res.cars.price;
        this.car_detail.description = res.cars.description;
        console.log(this.car_detail);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ngOnInit() {
    this.allCars();
    this.dataservice.getBrandsForEntry().subscribe({
      next: (data: any) => {
        this.availableBrands = data;
      },
      error: (err) => {
        console.error('Error fetching all brands:', err);
      },
    });
  }

  isDragging = false;
  selectedFileName = '';

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  handleFiles(files: FileList) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const newValidFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      if (!allowedTypes.includes(files[i].type)) {
        this.toast.error(`Format not allowed: ${files[i].name}`);
        continue;
      }
      newValidFiles.push(files[i]);

      const reader = new FileReader();
      const url = URL.createObjectURL(files[i]);
      this.previews.push(url);
    }

    if (newValidFiles.length > 0) {
      this.selectedFile = [...this.selectedFile, ...newValidFiles];

      this.selectedFileName =
        this.selectedFile.length > 1
          ? `${this.selectedFile.length} files selected`
          : this.selectedFile[0].name;

      console.log('Total files ready for upload:', this.selectedFile.length);
    }
  }

  removeImage(index: number) {

    const imageToRemove = this.previews[index];
    if(imageToRemove.startsWith('blob:')){
      const blobPreview = this.previews.filter(p=>p.startsWith('blob:'));
      const indexOriginal = blobPreview.indexOf(imageToRemove)
      if(indexOriginal != -1){
        this.selectedFile.splice(indexOriginal, 1);
      }
    }
    else{
      console.log("removing form views");
      
    }
    this.previews.splice(index, 1);

    if (this.selectedFile.length == 0) {
      this.selectedFileName = '';
    } else {
      this.selectedFileName = `${this.selectedFile.length} file(s) selected`;
    }
  }

  getformData(form: any) {
    console.log("InfoprmData");
    
    const formData = new FormData();
    const car_id = this.route.snapshot.paramMap.get('car_id');
    if (this.editMode && car_id) {
      formData.append('car_id', car_id);
      console.log("CARID",formData.get('car_id'));
    }
    const existingImages = this.previews.filter(p=>!p.startsWith('blob:')).map(p=>p.split('/').pop());
    formData.append("oldImages", JSON.stringify(existingImages));
    formData.append('brandName', form.value.brandName);
    formData.append('modelName', form.value.modelName);
    formData.append('category', form.value.category);
    formData.append('engineType', form.value.engineType);
    formData.append('horsePower', form.value.horsePower);
    formData.append('torque', form.value.torque);
    formData.append('topSpeed', form.value.topSpeed);
    formData.append('price', form.value.price);
    formData.append('description', form.value.description);
    if (this.selectedFile && this.selectedFile.length > 0) {
      for (let i = 0; i < this.selectedFile.length; i++)
        formData.append('image', this.selectedFile[i]);
    }
    return formData;
  }

  forEdit() {
    this.editMode = true;
  }

  forAdd() {
    this.editMode = false;
  }

  onSubmit(form: any) {
    if (this.editMode) {
      this.saveEdits(form);
    } else {
      this.update(form);
    }
  }

  update(form: any) {
    if (form.invalid) {
      this.toast.warning('Fix the errors before proceeding');
      return;
    }
    const forms = this.getformData(form);

    if (this.selectedFile.length === 0) {
      this.toast.warning('Upload image');
      return;
    }
  
    
    this.dataservice.addCar(forms).subscribe({
      next: (res: any) => {
        this.toast.success('Added Success');
        form.resetForm();
        this.selectedFile = [];
        this.selectedFileName = '';
        this.previews = [];
      },
      error: (err: any) => {
        this.toast.error('Wrong!!');
        console.log(err);
      },
    });
  }

  saveEdits(form: any) {
    if (form.invalid) {
      this.toast.warning('Fix the errors before proceeding');
      return;
    }
    if (this.previews.length === 0 && this.selectedFile.length === 0) {
      this.toast.warning('The car must have at least one image');
      return;
    }
    const forms = this.getformData(form);
       
    console.log("Before to servie",forms.get("car_id"));
    this.dataservice.editCar(forms).subscribe({
      next: (res: any) => {
        this.toast.success('Saved Edits');
      },
      error: (err: any) => {
        console.log(err);
        this.toast.error(err);
      },
    });
  }
}
