import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Subscription, switchMap, timer } from 'rxjs';
import { DataService } from './data.service';
import { AuthServiceService } from './auth-service.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class StatusserviceService {
  private pollingSub?: Subscription;

  constructor(private router: Router) {}

  private dataservice = inject(DataService);

  private authservice = inject(AuthServiceService);

  private toast = inject(ToastrService)

  startPolling() {
    const userId = this.dataservice.getUserId();
    if (!userId) return;
    this.pollingSub = timer(0, 30000)
      .pipe(
        switchMap(() => this.dataservice.getUserStatus(userId)),
        catchError((err) => {
          console.error('Status check failed', err);
          return [];
        }),
      )
      .subscribe({
        next: (res: any) => {
          if (res && (res.status === 'inactive' || res.status === 'Inactive')) {
            this.logoutAndRedirect();
          }
        },
        error:(err: any)=>{
          console.log(err)
        }
      });
  }

  stopPolling() {
    this.pollingSub?.unsubscribe();
  }

  logoutAndRedirect() {
    this.stopPolling();
    this.authservice.logout();
    this.router.navigate(['/']);
    this.toast.warning("You are Logged Out by Admin please login")
  }
}
