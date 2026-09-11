import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from '../config/db';
import { ActivityLog } from '../models/types';

export const registerClassroomSockets = (io: SocketIOServer): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join classroom channel by PIN / ID
    socket.on('classroom:join-room', (data: { roomCode: string; user?: any }) => {
      const room = data.roomCode ? data.roomCode.toUpperCase() : 'DEFAULT';
      socket.join(room);
      console.log(`[Socket] ${data.user?.name || socket.id} joined room channel: ${room}`);

      if (data.user) {
        // Broadcast presence
        socket.to(room).emit('classroom:user-joined', {
          user: data.user,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    // Student requests admission
    socket.on('student:request-admission', (data: { roomCode: string; student: any }) => {
      const room = data.roomCode.toUpperCase();
      console.log(`[Socket] Admission requested in ${room} by ${data.student?.name}`);
      // Notify teachers listening on this room
      socket.to(room).emit('teacher:new-admission-request', {
        student: data.student,
        roomCode: room,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    // Teacher approves student admission
    socket.on('teacher:admit-student', (data: { roomCode: string; studentId: string; studentName: string }) => {
      const room = data.roomCode.toUpperCase();
      console.log(`[Socket] Teacher admitted ${data.studentName} to ${room}`);
      io.to(room).emit('student:admission-approved', {
        studentId: data.studentId,
        studentName: data.studentName,
        roomCode: room
      });

      // Log activity
      const log: ActivityLog = {
        id: `act-${Date.now()}`,
        userId: data.studentId,
        userName: data.studentName,
        type: 'join',
        message: `${data.studentName} was admitted to classroom ${room}`,
        badgeType: 'success',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      db.update('activityLogs', logs => [log, ...logs]);
      io.to(room).emit('classroom:activity-feed-update', log);
    });

    // Teacher launches a live pulse poll
    socket.on('poll:broadcast-launch', (data: { roomCode: string; poll: any }) => {
      const room = data.roomCode.toUpperCase();
      console.log(`[Socket] Poll launched in ${room}: ${data.poll?.title}`);
      io.to(room).emit('poll:new-active', data.poll);
    });

    // Student casts a vote in real-time
    socket.on('poll:submit-vote', (data: { roomCode: string; pollId: string; optionIds: string[]; studentName: string }) => {
      const room = data.roomCode.toUpperCase();
      const poll = db.get('polls').find(p => p.id === data.pollId);
      io.to(room).emit('poll:live-update', {
        pollId: data.pollId,
        poll,
        voter: data.studentName
      });
    });

    // Student raises hand
    socket.on('student:raise-hand', (data: { roomCode: string; student: any }) => {
      const room = data.roomCode.toUpperCase();
      io.to(room).emit('student:hand-raised', {
        student: data.student,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};
