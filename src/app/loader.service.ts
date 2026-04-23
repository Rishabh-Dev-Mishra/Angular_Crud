import { Injectable } from '@angular/core';
import { request } from 'express';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  private requestCount = 0;

  show(){
    this.requestCount++;
    this.loading.next(true);
  }
  hide(){
    if(this.requestCount > 0)
      this.requestCount--;
    if(this.requestCount === 0)
    this.loading.next(false);
  }
}
