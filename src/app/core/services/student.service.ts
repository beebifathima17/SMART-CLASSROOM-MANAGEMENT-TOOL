import { Injectable, signal } from '@angular/core';
import { EnrolledStudent } from '../models/classroom.model';
import { ClassroomService } from './classroom.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  public readonly selectedStudent = signal<EnrolledStudent | null>(null);

  constructor(private classroomService: ClassroomService) {}

  getAllStudents(): EnrolledStudent[] {
    return this.classroomService.liveStudents();
  }

  getStudentById(id: string): EnrolledStudent | undefined {
    return this.classroomService.liveStudents().find(s => s.id === id);
  }

  selectStudent(student: EnrolledStudent | null): void {
    this.selectedStudent.set(student);
  }
}
