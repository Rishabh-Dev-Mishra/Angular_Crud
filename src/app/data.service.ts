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
}
