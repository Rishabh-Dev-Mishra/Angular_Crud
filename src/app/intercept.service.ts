import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators'
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptService implements HttpInterceptor{

  constructor(private loader: LoaderService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const skipLoader = req.headers.has('skip-loader');
    if(!skipLoader)
    this.loader.show();
    const token = sessionStorage.getItem('userToken');
    let request = req;
    if(token){
      request = req.clone({
        setHeaders:{
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request).pipe(
      finalize(() => {if(!skipLoader) this.loader.hide()}) 
    );
  }
}
