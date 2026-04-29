import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.css',
})
export class ConversationsComponent {
  private route = inject(ActivatedRoute);
  private dataservice = inject(DataService);

  car_id = this.route.snapshot.paramMap.get('car_id');
  convers: any[] = [];
  ngOnInit() {
    this.dataservice.getConver(this.car_id).subscribe({
      next: (res: any) => {
        this.convers = res;
      },
      error: (err: any) => {
        console.log(err.message);
      },
    });
  }
  private router = inject(Router);

  openChat(conv: any) {
    this.router.navigate(['/chats', conv.id]);
  }
}
