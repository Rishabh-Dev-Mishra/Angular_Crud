import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http'


@Injectable({
  providedIn: 'root'
})
export class DataService {
  url = "http://localhost:3000";
  constructor(private http: HttpClient){}
  register(data: any){
    return this.http.post(this.url+"/register", data);
  }
  
  login(data: any){
    return this.http.post(this.url+"/login", data);
  }
  
  
  public img_path: string = sessionStorage.getItem('userImage') || "";
  public userName: string = sessionStorage.getItem('userName') || "(..)";
  public userEmail: string = sessionStorage.getItem('userEmail') || "(..)";

  
  setProfileImage(path: string) {
    this.img_path = path;
    sessionStorage.setItem('userImage', path);
  }
  setInfo(name: string, email:string){
    this.userName = name;
    this.userEmail = email;
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userEmail', email);
  }
  edit(data: any){
    return this.http.post(this.url+"/edit-profile",data);
  }

  addBrand(data: any){
    return this.http.post(this.url+"/brand_details", data)
  }

  addCar(data: any){
    console.log(data);
    return this.http.post(this.url+"/car_details", data)
  }

  getBrands(){
    return this.http.get(this.url+"/brands");
  }

}
