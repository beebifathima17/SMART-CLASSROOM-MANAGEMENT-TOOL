import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, StatCardComponent, ChartComponent, IconComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  userGrowthData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Active Students',
        data: [420, 580, 720, 890, 1100, 1250, 1380, 1540, 1820],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.35
      },
      {
        label: 'Faculty / Teachers',
        data: [35, 42, 50, 62, 70, 78, 85, 92, 104],
        borderColor: '#10b981',
        fill: false,
        tension: 0.35
      }
    ]
  };

  classroomActivityData: ChartConfiguration['data'] = {
    labels: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Tech'],
    datasets: [
      {
        label: 'Active Sessions Hosted',
        data: [142, 98, 76, 54, 112],
        backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'],
        borderRadius: 6
      }
    ]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };
}
