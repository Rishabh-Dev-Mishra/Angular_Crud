import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
import { AuthServiceService } from './auth-service.service';
import { StatusserviceService } from './statusservice.service';
import { LoaderService } from './loader.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  constructor(private dataservice: DataService, private auth:AuthServiceService, private statusservice: StatusserviceService, protected loaderService: LoaderService) {}
  title = 'Car Gallery';

  ngOnInit(){
    if(this.auth.isLoggedIn()){
      this.statusservice.startPolling();
    }
  }
  ngOnDestroy(){
    this.statusservice.stopPolling();
  }
}