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
  constructor(
    private zone: NgZone,
    private location: Location,
  ) {}
  private dataservice = inject(DataService);
  private socketservice = inject(SocketServiceService);

  private route = inject(ActivatedRoute);
  private toast = inject(ToastrService);

  currentTime = new Date();
  currentDate = new Date();

  private conversationId = this.route.snapshot.paramMap.get('id');
  messages: any[] = [];

  messageText: string = '';
  currentUserId: string = String(this.dataservice.getUserId());
  buyerFirstName: string = '';
  buyerLastName: string = '';

  sellerFirstName: string = '';
  sellerLastName: string = '';

  sellerId: string = '';
  buyerId: string = '';

  get receiverId(): string {
    return this.currentUserId == this.buyerId ? this.sellerId : this.buyerId;
  }

  onlineUsers: string[] = [];

  typingTimeOut: any;
  isTyping: boolean = false;
  otherIsTyping: boolean = false;

  typingMessage = 'Typing...';

  ngOnInit() {
    this.dataservice.getBuyerName(this.conversationId).subscribe({
      next: (res: any) => {
        this.buyerFirstName = res[0].firstname;
        this.buyerLastName = res[0].lastname;
        this.buyerId = String(res[0].id);
      },
    });

    this.dataservice.getSellerName(this.conversationId).subscribe({
      next: (res: any) => {
        this.sellerFirstName = res[0].firstname;
        this.sellerLastName = res[0].lastname;
        this.sellerId = String(res[0].seller_id);
      },
    });

    this.socketservice.connect(this.currentUserId);
    this.socketservice.onlineUsers$.subscribe((users) => {
      this.onlineUsers = users;
    });
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
      this.zone.run(() => {
        if (newMsg.sender_id !== this.currentUserId) {
          this.messages = [...this.messages, newMsg];
        }
      });
    });

    this.socketservice.onTyping().subscribe((data: any) => {
      if (data.currentUserId !== this.currentUserId) {
        this.otherIsTyping = true;
      }
    });

    this.socketservice.onStopTyping().subscribe((data: any) => {
      if (data.currentUserId !== this.currentUserId) {
        this.otherIsTyping = false;
      }
    });
  }

  onInputChanged() {
    if (!this.isTyping) {
      this.isTyping = true;
      this.socketservice.sendTyping({
        currentUserId: this.currentUserId,
        recieverId: this.receiverId,
        roomId: `conv_${this.conversationId}`,
      });
    }
    clearTimeout(this.typingTimeOut);
    this.typingTimeOut = setTimeout(() => {
      this.isTyping = false;
      this.socketservice.sendStopTyping({
        currentUserId: this.currentUserId,
        recieverId: this.receiverId,
        roomId: `conv_${this.conversationId}`,
      });
    }, 1500);
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
    this.socketservice.sendStopTyping({
      currentUserId: this.currentUserId,
      recieverId: this.receiverId,
      roomId: `conv_${this.conversationId}`,
    });

    this.isTyping = false;

    this.messageText = '';
  }

  ngOnDestroy() {
    if (this.conversationId) {
      this.socketservice.leaveRoom(`conv_${this.conversationId}`);
    }
    this.socketservice.disconnect();
  }

  isDifferentDate(curr: any, prev: any): boolean {
    const currDate = new Date(curr.created_at).toDateString();
    const prevDate = new Date(prev.created_at).toDateString();

    return currDate !== prevDate;
  }

  getDayLabel(date: string | null | undefined): string {
    if (!date) return 'New'; // prevent invalid

    const msgDate = new Date(date);

    // check invalid date
    if (isNaN(msgDate.getTime())) return 'New';

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // normalize time (important)
    const msg = new Date(msgDate.setHours(0, 0, 0, 0));
    const tdy = new Date(today.setHours(0, 0, 0, 0));
    const yest = new Date(yesterday.setHours(0, 0, 0, 0));

    if (msg.getTime() === tdy.getTime()) {
      return 'Today';
    } else if (msg.getTime() === yest.getTime()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString();
    }
  }

  goBack() {
    this.socketservice.onlineUsers$.subscribe((users) => {
      this.onlineUsers = users;
    });
    this.location.back();
  }

  acceptModal: boolean = false;

  accept() {
    this.acceptModal = !this.acceptModal;
  }

  rejectModal: boolean = false;

  reject() {
    this.rejectModal = !this.rejectModal;
  }

  confirmAccept() {
    const data = {
      converId: this.conversationId,
    };
    this.dataservice.acceptOffer(data).subscribe({
      next: (res: any) => {
        this.toast.success('Accepted the offer');
        this.accept();
        this.location.back();
      },
      error: (err: any) => {},
    });
  }

  confirmReject() {
    const data = {
      converId: this.conversationId,
    };
    this.dataservice.rejectOffer(data).subscribe({
      next: (res: any) => {
        this.toast.info('Rejected the offer');
        this.reject();
        this.location.back();
      },
      error: (err: any) => {},
    });
  }
}
