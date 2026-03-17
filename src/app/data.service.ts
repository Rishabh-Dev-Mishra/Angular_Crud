import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http'


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/api';

  postUserData(data: any){
    return this.http.post(`${this.url}/users`, data);
  }

  getUserData(){
    return this.http.get(`${this.url}/users`)
  }
}
