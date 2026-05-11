import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})

export class SocketServiceService {
  private socket: Socket | null = null;
  private readonly URL = 'https://angular-crud-pvj9.onrender.com';
  // private readonly URL = 'http://localhost:3000';

  socketId: any;
  

  onlineUsers$ = new BehaviorSubject<string[]>([]);
  
  connect(userId: string): void {
    console.log('Attempting to connect to socket at:', this.URL);
    if (this.socket) return;

    this.socket = io(this.URL);

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.socketId = this.socket?.id
      this.setUserOnline(userId);
    });

    this.socket.on('usersOnline', (users: string[]) => {
      this.onlineUsers$.next(users);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  joinRoom(roomId: string): void {
    console.log('Joining room:', `conv_${roomId}`);
    this.socket?.emit('joinRoom', roomId);
  }

  leaveRoom(roomId: string): void {
    this.socket?.emit('leaveRoom', roomId);
  }

  sendMessage(data: any): void {
    this.socket?.emit('sendMessage', data);
  }

  setUserOnline(userId: string): void {
    this.socket?.emit('userOnline', userId);
  }

  sendTyping(data: any): void{
    this.socket?.emit("typingMessage", data)
  }

  sendStopTyping(data: any): void{
    this.socket?.emit("stopTypingMessage", data);
  }

  onTyping(): Observable<any>{
    return new Observable((observer)=>{
      const handler = (data:any)=>{
        observer.next(data);
      }
      this.socket?.on('typing', handler);
      return ()=>{
        this.socket?.off('typing', handler);
      }
    })
  }

  onStopTyping(): Observable<any>{
    return new Observable((observer)=>{
      const handler = (data:any)=>{
        observer.next(data);
      }
      this.socket?.on('stopTyping', handler);
      return ()=>{
        this.socket?.off('stopTyping', handler)
      }
    })
  }

  onMessage(): Observable<any> {
    return new Observable((observer) => {
      const handler = (data: any) => {
        observer.next(data);
      };

      this.socket?.on('receiveMessage', handler);

      return () => {
        this.socket?.off('receiveMessage', handler);
      };
    });
  }


  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
