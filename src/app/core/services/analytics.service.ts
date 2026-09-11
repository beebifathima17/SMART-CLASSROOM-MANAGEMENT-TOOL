import { Injectable, signal } from '@angular/core';
import { AnalyticsSummary, SessionParticipationPoint } from '../models/analytics.model';
import { ToastService } from './toast.service';

const INITIAL_SUMMARY: AnalyticsSummary = {
  totalSessions: 12,
  totalStudents: 48,
  averageParticipation: 91.5,
  averageQuizScore: 84.8,
  totalPollResponses: 384,
  participationTrend: [
    { sessionLabel: 'Lec 1: Intro to Web', participationRate: 98, attendanceCount: 48, date: 'Aug 10' },
    { sessionLabel: 'Lec 2: Semantic HTML5', participationRate: 95, attendanceCount: 47, date: 'Aug 14' },
    { sessionLabel: 'Lec 3: Modern CSS3', participationRate: 92, attendanceCount: 46, date: 'Aug 17' },
    { sessionLabel: 'Lec 4: Flexbox Layouts', participationRate: 88, attendanceCount: 44, date: 'Aug 21' },
    { sessionLabel: 'Lec 5: CSS Grid System', participationRate: 94, attendanceCount: 46, date: 'Aug 24' },
    { sessionLabel: 'Lec 6: JS Fundamentals', participationRate: 90, attendanceCount: 45, date: 'Aug 28' },
    { sessionLabel: 'Lec 7: DOM APIs', participationRate: 89, attendanceCount: 43, date: 'Aug 31' },
    { sessionLabel: 'Lec 8: Async & Promises', participationRate: 93, attendanceCount: 46, date: 'Sep 03' },
    { sessionLabel: 'Lec 9: Event Loop', participationRate: 87, attendanceCount: 42, date: 'Sep 05' },
    { sessionLabel: 'Lec 10: TypeScript Basics', participationRate: 91, attendanceCount: 45, date: 'Sep 08' },
    { sessionLabel: 'Lec 11: RxJS Observables', participationRate: 90, attendanceCount: 44, date: 'Sep 10' },
    { sessionLabel: 'Lec 12: Angular Signals', participationRate: 94, attendanceCount: 46, date: 'Today' }
  ],
  topicPerformances: [
    { topic: 'HTML5 & Semantics', averageScore: 94, totalAttempts: 48 },
    { topic: 'CSS Grid & Flexbox', averageScore: 88, totalAttempts: 48 },
    { topic: 'Async JavaScript & Promises', averageScore: 79, totalAttempts: 46 },
    { topic: 'Angular Architecture & Signals', averageScore: 86, totalAttempts: 45 },
    { topic: 'TypeScript Types & Generics', averageScore: 82, totalAttempts: 47 }
  ],
  pollTypeDistribution: [
    { type: 'Multiple Choice', count: 24 },
    { type: 'Yes / No Check', count: 12 },
    { type: 'Rating (1-5 Star)', count: 8 },
    { type: 'Open Feedback', count: 4 }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private analyticsSignal = signal<AnalyticsSummary>(INITIAL_SUMMARY);
  public readonly summary = this.analyticsSignal.asReadonly();

  constructor(private toast: ToastService) {}

  exportCSV(filename: string = 'smartclass-engagement-report.csv'): void {
    const data = this.analyticsSignal().participationTrend;
    const headers = ['Session', 'Date', 'Attendance Count', 'Participation Rate (%)'];
    const rows = data.map(item => [
      `"${item.sessionLabel}"`,
      `"${item.date}"`,
      item.attendanceCount,
      `${item.participationRate}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toast.success('Engagement analytics CSV downloaded successfully!', 'Export Complete');
  }

  exportReport(): void {
    this.toast.info('Generating comprehensive PDF report for Web Technologies (WT301)...', 'Export Report');
    setTimeout(() => {
      window.print();
    }, 400);
  }
}
