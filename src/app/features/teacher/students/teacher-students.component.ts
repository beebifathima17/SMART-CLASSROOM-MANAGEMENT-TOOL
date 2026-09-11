import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassroomService } from '../../../core/services/classroom.service';
import { EnrolledStudent } from '../../../core/models/classroom.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StudentDetailModalComponent } from '../../../shared/components/student-detail-modal/student-detail-modal.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-teacher-students',
  imports: [CommonModule, FormsModule, IconComponent, StudentDetailModalComponent, ModalComponent],
  templateUrl: './teacher-students.component.html',
  styleUrls: ['./teacher-students.component.css']
})
export class TeacherStudentsComponent {
  protected classroomService = inject(ClassroomService);
  private toast = inject(ToastService);

  searchTerm: string = '';
  statusFilter: string = 'all';
  selectedStudent: EnrolledStudent | null = null;

  isAddStudentModalOpen = false;
  newStudent = {
    name: '',
    email: ''
  };

  get students(): EnrolledStudent[] {
    return this.classroomService.liveStudents().filter(s => {
      const matchSearch = s.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = this.statusFilter === 'all' || s.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  viewStudentProfile(student: EnrolledStudent): void {
    this.selectedStudent = student;
  }

  closeModal(): void {
    this.selectedStudent = null;
  }

  openAddStudent(): void {
    this.newStudent = { name: '', email: '' };
    this.isAddStudentModalOpen = true;
  }

  closeAddStudent(): void {
    this.isAddStudentModalOpen = false;
  }

  saveStudent(): void {
    if (!this.newStudent.name || !this.newStudent.email) {
      this.toast.error('Please enter both student full name and email.');
      return;
    }

    this.classroomService.addStudentToRoster(this.newStudent.name, this.newStudent.email);
    this.closeAddStudent();
  }
}
