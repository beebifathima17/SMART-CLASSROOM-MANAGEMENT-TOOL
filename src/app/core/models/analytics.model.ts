export interface SessionParticipationPoint {
  sessionLabel: string;
  participationRate: number;
  attendanceCount: number;
  date: string;
}

export interface TopicPerformance {
  topic: string;
  averageScore: number;
  totalAttempts: number;
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalStudents: number;
  averageParticipation: number;
  averageQuizScore: number;
  totalPollResponses: number;
  participationTrend: SessionParticipationPoint[];
  topicPerformances: TopicPerformance[];
  pollTypeDistribution: {
    type: string;
    count: number;
  }[];
}
