import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-student-participation',
  imports: [CommonModule, RouterModule, StatCardComponent, ChartComponent],
  templateUrl: './student-participation.component.html',
  styleUrls: ['./student-participation.component.css']
})
export class StudentParticipationComponent {
  protected authService = inject(AuthService);
  protected classroomService = inject(ClassroomService);

  chartData: ChartConfiguration['data'] = {
    labels: ['Lec 1', 'Lec 2', 'Lec 3', 'Lec 4', 'Lec 5', 'Lec 6', 'Lec 7', 'Lec 8', 'Lec 9', 'Lec 10', 'Lec 11', 'Lec 12'],
    datasets: [
      {
        label: 'My Participation (%)',
        data: [100, 100, 95, 90, 100, 95, 90, 100, 85, 95, 100, 100],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#4f46e5'
      }
    ]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 60, max: 100, grid: { color: '#f1f5f9' }, ticks: { callback: (val) => `${val}%` } },
      x: { grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };
}
