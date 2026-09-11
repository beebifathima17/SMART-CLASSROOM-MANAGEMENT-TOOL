import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PollService } from '../../../core/services/poll.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-live-poll',
  imports: [CommonModule, RouterModule, ChartComponent, IconComponent],
  templateUrl: './live-poll.component.html',
  styleUrls: ['./live-poll.component.css']
})
export class LivePollComponent implements OnInit {
  protected pollService = inject(PollService);
  protected classroomService = inject(ClassroomService);
  private router = inject(Router);
  protected Math = Math;

  chartType: 'bar' | 'doughnut' = 'bar';

  currentPoll = computed(() => this.pollService.activePoll());

  get barChartData(): ChartConfiguration['data'] {
    const poll = this.currentPoll();
    if (!poll) return { labels: [], datasets: [] };

    return {
      labels: poll.options.map(o => o.text),
      datasets: [
        {
          label: 'Student Votes',
          data: poll.options.map(o => o.votes),
          backgroundColor: [
            'rgba(99, 102, 241, 0.85)',
            'rgba(139, 92, 246, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(236, 72, 153, 0.85)',
            'rgba(6, 182, 212, 0.85)'
          ],
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    };
  }

  get donutChartData(): ChartConfiguration['data'] {
    const poll = this.currentPoll();
    if (!poll) return { labels: [], datasets: [] };

    return {
      labels: poll.options.map(o => o.text),
      datasets: [
        {
          data: poll.options.map(o => o.votes),
          backgroundColor: [
            '#6366f1',
            '#8b5cf6',
            '#10b981',
            '#f59e0b',
            '#ec4899',
            '#06b6d4'
          ]
        }
      ]
    };
  }

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { stepSize: 2, font: { family: "'Plus Jakarta Sans', sans-serif" } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  donutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };

  ngOnInit(): void {
    if (!this.pollService.activePoll()) {
      const firstPoll = this.pollService.polls()[0];
      if (firstPoll) this.pollService.activePoll.set(firstPoll);
    }
  }

  togglePause(): void {
    const poll = this.currentPoll();
    if (!poll) return;
    if (poll.status === 'active') {
      this.pollService.pausePoll(poll.id);
    } else {
      this.pollService.resumePoll(poll.id);
    }
  }

  endPoll(): void {
    const poll = this.currentPoll();
    if (!poll) return;
    this.pollService.endPoll(poll.id);
  }

  toggleShare(): void {
    const poll = this.currentPoll();
    if (!poll) return;
    this.pollService.toggleShareResults(poll.id);
  }

  setChartType(type: 'bar' | 'doughnut'): void {
    this.chartType = type;
  }

  formatTime(seconds?: number): string {
    if (seconds === undefined || seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
