import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../data.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, NgIf, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  

  constructor(private location: Location) {}
  private dataservice = inject(DataService);
  private route = inject(ActivatedRoute);
  readonly serverUrl = 'http://localhost:3000/'; 
  name:string = '';
  email:string = '';

  user_id = this.route.snapshot.paramMap.get('user_id');
  path:string = '';
  status:string ='';

  getUser(){
    this.dataservice.getUserInfo(this.user_id).subscribe({
      next:(res:any)=>{
        this.name = res.firstname;
        this.email = res.email;
        this.path = res.image_path;
        this.status = res.status;
      },
      error:(err:any)=>{
        console.log(err);
        
      }
    })
  }

  ngOnInit(){
    this.getUser();
  }

  get imageURL(): string {
  return this.path && (this.path.length > 0) ? `${this.serverUrl}uploads/${this.path}` : '';
  }

  goBack(){
    this.location.back();
  }
}
