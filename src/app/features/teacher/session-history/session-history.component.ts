import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassroomService } from '../../../core/services/classroom.service';
import { ClassroomSession } from '../../../core/models/classroom.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-session-history',
  imports: [CommonModule, IconComponent, ModalComponent],
  templateUrl: './session-history.component.html',
  styleUrls: ['./session-history.component.css']
})
export class SessionHistoryComponent {
  protected classroomService = inject(ClassroomService);

  selectedSession: ClassroomSession | null = null;

  openSessionDetail(session: ClassroomSession): void {
    this.selectedSession = session;
  }

  closeModal(): void {
    this.selectedSession = null;
  }
}
