import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketServiceService {
  private socket: Socket | null = null;
  private readonly URL = 'http://localhost:3000';

  connect(): void {
    if (this.socket && this.socket.connected) return;

    this.socket = io(this.URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }

  joinRoom(roomId: string): void {
    this.socket?.emit('joinRoom', roomId);
  }

  leaveRoom(roomId: string): void {
    this.socket?.emit('leaveRoom', roomId);
  }

  sendMessage(data: any): void {
    this.socket?.emit('sendMessage', data);
  }

  onMessage(): Observable<any> {
    return new Observable((observer) => {
      const handler = (data: any) => {
        observer.next(data);
      };

      this.socket?.on('receiveMessage', handler);

      // 🔥 cleanup when unsubscribed
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
