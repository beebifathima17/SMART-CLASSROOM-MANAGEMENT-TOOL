import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClassroomService } from '../../../core/services/classroom.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-join-classroom',
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './join-classroom.component.html',
  styleUrls: ['./join-classroom.component.css']
})
export class JoinClassroomComponent implements OnInit, OnDestroy {
  protected classroomService = inject(ClassroomService);
  protected authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  roomCode: string = '';
  joinStatus: 'idle' | 'pending' | 'approved' | 'rejected' = 'idle';
  pendingClassroomName: string = '';
  pendingRoomCode: string = '';
  private checkInterval: any = null;

  recentClassrooms = [
    { code: 'WT7K92', name: 'Web Technologies (WT301)', teacher: 'Course Instructor', time: 'Active Live Now', isLive: true }
  ];

  ngOnInit(): void {
    const student = this.authService.currentUser();
    if (student) {
      const activeClass = this.classroomService.activeClassroom();
      const status = this.classroomService.getStudentRequestStatus(student.id, activeClass.roomCode);
      if (status === 'pending') {
        this.joinStatus = 'pending';
        this.pendingRoomCode = activeClass.roomCode;
        this.pendingClassroomName = activeClass.name;
        this.startCheckingApproval();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.checkInterval) clearInterval(this.checkInterval);
  }

  joinClassroom(codeToJoin?: string): void {
    const code = (codeToJoin || this.roomCode).trim().toUpperCase();
    if (!code) {
      this.toast.error('Please enter a 6-character classroom code.');
      return;
    }

    const student = this.authService.currentUser();
    const studentData = {
      id: student?.id || `stu-${Date.now()}`,
      name: student?.name || 'Student',
      email: student?.email || 'student@university.edu'
    };

    const res = this.classroomService.requestJoinClassroom(studentData, code);

    if (res.status === 'approved') {
      this.toast.success(`Connected to ${res.classroom?.name}!`, 'Room Joined');
      this.router.navigate(['/student/live-poll']);
    } else if (res.status === 'pending') {
      this.joinStatus = 'pending';
      this.pendingRoomCode = code;
      this.pendingClassroomName = res.classroom?.name || 'Classroom';
      this.startCheckingApproval();
    } else if (res.status === 'rejected') {
      this.joinStatus = 'rejected';
      this.toast.error('Your join request was declined by the instructor.');
    }
  }

  private startCheckingApproval(): void {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => {
      const student = this.authService.currentUser();
      if (!student) return;
      const status = this.classroomService.getStudentRequestStatus(student.id, this.pendingRoomCode);
      if (status === 'approved') {
        clearInterval(this.checkInterval);
        this.joinStatus = 'approved';
        this.toast.success('Your teacher approved your admission! Entering classroom...', 'Admitted');
        setTimeout(() => {
          this.router.navigate(['/student/live-poll']);
        }, 1000);
      } else if (status === 'rejected') {
        clearInterval(this.checkInterval);
        this.joinStatus = 'rejected';
      }
    }, 1200);
  }

  cancelRequest(): void {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.joinStatus = 'idle';
  }

  fillCode(code: string): void {
    this.roomCode = code;
    this.joinClassroom(code);
  }
}
