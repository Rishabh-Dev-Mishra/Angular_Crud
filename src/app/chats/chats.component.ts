import { Component, inject, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { SocketServiceService } from '../socket-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css',
})
export class ChatsComponent {
  constructor(private zone: NgZone){}
  private dataservice = inject(DataService);
  private socketservice = inject(SocketServiceService);

  private route = inject(ActivatedRoute);

  private conversationId = this.route.snapshot.paramMap.get('id');
  messages: any[] = [];

  messageText: string = '';
  currentUserId = this.dataservice.getUserId();

  ngOnInit() {
    this.socketservice.connect();
     if (this.conversationId) {
    this.socketservice.joinRoom(`conv_${this.conversationId}`);
  }
    this.dataservice.getMessages(this.conversationId).subscribe({
      next: (res: any) => {
        this.messages = res;
      },
      error: (err: any) => {},
    });

    this.socketservice.onMessage().subscribe((newMsg: any) => {
      console.log("New Message");
      
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
}
