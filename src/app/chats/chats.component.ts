import { Component, inject, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { SocketServiceService } from '../socket-service.service';
import { CommonModule, Location, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css',
})
export class ChatsComponent {
  constructor(private zone: NgZone, private location: Location){}
  private dataservice = inject(DataService);
  private socketservice = inject(SocketServiceService);

  private route = inject(ActivatedRoute);
  private toast = inject(ToastrService);

  currentTime = new Date();
  currentDate = new Date();

  private conversationId = this.route.snapshot.paramMap.get('id');
  messages: any[] = [];

  messageText: string = '';
  currentUserId = this.dataservice.getUserId();
  buyerFirstName: string = '';
  buyerLastName: string = '';

  sellerFirstName: string = '';
  sellerLastName: string = '';

  sellerId: string = '';

  

  ngOnInit() {
    this.dataservice.getBuyerName(this.conversationId).subscribe({
      next:(res:any)=>{
        this.buyerFirstName = res[0].firstname;
        this.buyerLastName = res[0].lastname;
      }
    })
    
    this.dataservice.getSellerName(this.conversationId).subscribe({
      next:(res:any)=>{
        this.sellerFirstName = res[0].firstname;
        this.sellerLastName = res[0].lastname;
        this.sellerId = res[0].seller_id;
      }
    })

    this.socketservice.connect();
     if (this.conversationId) {
    this.socketservice.joinRoom(`conv_${this.conversationId}`);
  }
    this.dataservice.getMessages(this.conversationId).subscribe({
      next: (res: any) => {
        this.messages = res.reverse();
      },
      error: (err: any) => {},
    });

    this.socketservice.onMessage().subscribe((newMsg: any) => {

      
      this.zone.run(()=>{
        if (newMsg.sender_id !== this.currentUserId) {
        this.messages = [...this.messages, newMsg]; 
      }
      })
      
    });
  }
  sendMessage() {
    if (!this.messageText.trim()) return;

    const msgData = {
      conversation_id: this.conversationId,
      message: this.messageText,
      sender_id: this.currentUserId,
      roomId: `conv_${this.conversationId}`,
    };

    const payload = {
      conversation_id: this.conversationId,
      message: this.messageText,
      sender_id: this.currentUserId,
      roomId: `conv_${this.conversationId}`,
    };

    this.socketservice.sendMessage(msgData);
    this.dataservice.insertMessage(payload).subscribe({
      next: (response) => {
        console.log('Message sent!', response);
      },
      error: (err) => {
        console.error('Failed to send message', err);
      },
    });

    this.messages.push(msgData);

    this.messageText = '';
  }
  ngOnDestroy() {
    if (this.conversationId) {
      this.socketservice.leaveRoom(`conv_${this.conversationId}`);
    }
  }


  isDifferentDate(curr: any, prev: any): boolean {
  const currDate = new Date(curr.created_at).toDateString();
  const prevDate = new Date(prev.created_at).toDateString();

  return currDate !== prevDate;
}

getDayLabel(date: string): string {
  const msgDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (msgDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (msgDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return msgDate.toLocaleDateString();
  }
}

  goBack(){
    this.location.back()
  }


  acceptModal: boolean = false;

  accept(){
    this.acceptModal = !this.acceptModal
  }

  rejectModal: boolean = false;

  reject(){
    this.rejectModal = !this.rejectModal
  }

  confirmAccept(){
    const data = {
      converId: this.conversationId
    }
    this.dataservice.acceptOffer(data).subscribe({
      next:(res:any)=>{
        this.toast.success("Accepted the offer")
        this.accept();
        this.location.back();
      },
      error:(err:any)=>{

      }
    })
  }

  confirmReject(){
    const data = {
      converId: this.conversationId
    }
    this.dataservice.rejectOffer(data).subscribe({
      next:(res:any)=>{
        this.toast.info("Rejected the offer")
        this.reject();
        this.location.back();
      },
      error:(err:any)=>{
        
      }
    })
  }

}
