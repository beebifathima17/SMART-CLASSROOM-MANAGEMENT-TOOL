import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private serverUrl = 'http://localhost:5000';

  constructor() {
    this.initSocket();
  }

  private initSocket(): void {
    try {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000
      });

      this.socket.on('connect', () => {
        console.log('[SocketService] Connected to backend WebSocket server:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[SocketService] Disconnected:', reason);
      });

      this.socket.on('connect_error', (err) => {
        // Fallback gracefully without breaking UI
        console.warn('[SocketService] WebSocket connection error (using local state fallback):', err.message);
      });
    } catch (err) {
      console.warn('[SocketService] Could not initialize socket connection:', err);
    }
  }

  joinRoom(roomCode: string, user?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('classroom:join-room', { roomCode, user });
    }
  }

  requestAdmission(roomCode: string, student: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('student:request-admission', { roomCode, student });
    }
  }

  admitStudent(roomCode: string, studentId: string, studentName: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('teacher:admit-student', { roomCode, studentId, studentName });
    }
  }

  launchPoll(roomCode: string, poll: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('poll:broadcast-launch', { roomCode, poll });
    }
  }

  submitVote(roomCode: string, pollId: string, optionIds: string[], studentName: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('poll:submit-vote', { roomCode, pollId, optionIds, studentName });
    }
  }

  raiseHand(roomCode: string, student: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('student:raise-hand', { roomCode, student });
    }
  }

  listen<T>(eventName: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (!this.socket) return;
      const handler = (data: T) => subscriber.next(data);
      this.socket.on(eventName, handler);
      return () => {
        if (this.socket) {
          this.socket.off(eventName, handler);
        }
      };
    });
  }
}
