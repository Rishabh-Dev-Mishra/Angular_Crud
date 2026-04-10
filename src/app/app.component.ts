import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './data.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

    constructor(private dataservice: DataService) {}
  title = 'Car Gallery';
   @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
      this.dataservice.logOut().subscribe();
    
  }
}