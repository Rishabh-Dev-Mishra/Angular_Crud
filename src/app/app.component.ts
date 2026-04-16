import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
import { AuthServiceService } from './auth-service.service';
import { StatusserviceService } from './statusservice.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

    constructor(private dataservice: DataService, private auth:AuthServiceService, private statusservice: StatusserviceService) {}
  title = 'Car Gallery';
   @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
      this.dataservice.logOut().subscribe();
    
  }
  ngOnInit(){
    if(this.auth.isLoggedIn()){
      this.statusservice.startPolling();
    }
  }
  ngOnDestroy(){
    if(this.auth.isLoggedIn()){
      this.statusservice.startPolling();
    }
    this.statusservice.stopPolling();
  }
}