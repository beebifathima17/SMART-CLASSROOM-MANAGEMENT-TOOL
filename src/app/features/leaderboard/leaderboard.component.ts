import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClassroomService } from '../../core/services/classroom.service';
import { QuizService } from '../../core/services/quiz.service';
import { PollService } from '../../core/services/poll.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  quizScore: number;
  pollsAnswered: number;
  totalPoints: number;
  accuracy: number;
  badge: string;
  badgeColor: string;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent {
  protected classroomService = inject(ClassroomService);
  protected quizService = inject(QuizService);
  protected pollService = inject(PollService);
  protected authService = inject(AuthService);

  get leaderboardEntries(): LeaderboardEntry[] {
    const students = this.classroomService.liveStudents();
    if (students.length === 0) {
      return [];
    }

    const entries: LeaderboardEntry[] = students.map((stu, index) => {
      // Calculate scores dynamically based on student participation
      const quizPoints = (stu.quizAverage || 0) * 10;
      const pollPoints = (stu.pollsAnswered || 0) * 15;
      const participationBonus = (stu.participationPercentage || 100) * 2;
      const total = quizPoints + pollPoints + participationBonus;
      const accuracy = stu.quizAverage || stu.participationPercentage || 95;

      let badge = 'Active Scholar';
      let badgeColor = 'badge-indigo';
      if (accuracy >= 90) {
        badge = '🎯 High Accuracy';
        badgeColor = 'badge-active';
      } else if (stu.pollsAnswered >= 3) {
        badge = '⚡ Speed Pulse';
        badgeColor = 'badge-amber';
      }

      return {
        rank: 0,
        id: stu.id,
        name: stu.name,
        email: stu.email,
        avatarUrl: stu.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(stu.name)}`,
        quizScore: stu.quizAverage || 0,
        pollsAnswered: stu.pollsAnswered || 0,
        totalPoints: Math.round(total),
        accuracy: Math.round(accuracy),
        badge,
        badgeColor
      };
    });

    // Sort by points descending
    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return entries;
  }

  get topThree(): LeaderboardEntry[] {
    return this.leaderboardEntries.slice(0, 3);
  }
}
