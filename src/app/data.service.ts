import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  url = 'http://localhost:3000';
  constructor(private http: HttpClient) {}
  register(data: any) {
    return this.http.post(this.url + '/register', data);
  }

  login(data: any) {
    return this.http.post(this.url + '/login', data);
  }

  public img_path: string = sessionStorage.getItem('userImage') || '';
  public userName: string = sessionStorage.getItem('userName') || '(..)';
  public userEmail: string = sessionStorage.getItem('userEmail') || '(..)';
  public user_id: string = sessionStorage.getItem('user_id') || '(..)';

  setProfileImage(path: string) {
    this.img_path = path;
    sessionStorage.setItem('userImage', path);
  }
  getUserId(): string | null {
    return sessionStorage.getItem('user_id');
  }

  setInfo(name: string, email: string, user_id: any) {
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('user_id', user_id.toString());
  }

  logOut(){
    const user_id = this.getUserId();
    return this.http.put(`${this.url}/logout/${user_id}`,"inactive");
  }

  allCars() {
    const user_id = this.getUserId();
    return this.http.get(`${this.url}/allcars/${user_id}`);
  }

  getBrands() {
    const id = this.getUserId();
    console.log(id);

    return this.http.get(`${this.url}/brands/${id}`);
  }

  edit(data: any) {
    return this.http.post(this.url + '/edit-profile', data);
  }

  addBrand(data: any) {
    return this.http.post(this.url + '/brand_details', data);
  }

  addCar(formData: FormData) {
    const id = this.getUserId();
    return this.http.post(`${this.url}/car_details/${id}`, formData);
  }

  getBrandsForEntry() {
    return this.http.get(`${this.url}/brands`);
  }

  filteredBrands(data: any) {
    const id = this.getUserId();
    return this.http.get(`${this.url}/brands/search/${data}/${id}`);
  }

  filteredCars(id: string, name: string, category: string, engine: string) {
    const user_id = this.getUserId();
    return this.http.get(
      `${this.url}/cars/search/${id}/${name}/${category}/${engine}/${user_id}`,
    );
  }

  getCars(id: string, name: string, limit: any, offset:any) {
    console.log(id)
    console.log(name);
    const user_id = this.getUserId();
    return this.http.get(`${this.url}/cars/${id}/${user_id}/${limit}/${offset}`);
  }

  getCarsPerBrand(id: string, name: string) {
    console.log(id)
    console.log(name);
    const user_id = this.getUserId();
    return this.http.get(`${this.url}/cars/${id}/${user_id}`);
  }

  private id: string = '';
  private name: string = '';

  setIdForNavig(id: string, name: string) {
    this.id = id;
    this.name = name;
    sessionStorage.setItem('navigId', id);
    sessionStorage.setItem('navigName', name);
  }

  getIdForNavig() {
    return {
      id: this.id || sessionStorage.getItem('navigId'),
      name: this.name || sessionStorage.getItem('navigName'),
    };
  }

  getImagesOfOne(id: any) {
    const user_id = this.getUserId();
    return this.http.get(`${this.url}/cars_images/${id}/${user_id}`);
  }

  deleteCar(car: any) {
    const user_id = this.getUserId();
    const car_id = car.car_id;
    return this.http.delete(`${this.url}/delete_car/${car_id}/${user_id}`);
  }

  getSingleCar(car:string){
    console.log("Car id from dataservice", car);
    
    return this.http.get(`${this.url}/singleCar/${car}`);
  }

  editCar(data:any){
    console.log("inside service",data.get("car_id"));
    
    return this.http.put(`${this.url}/editCar`, data);
  }
}
