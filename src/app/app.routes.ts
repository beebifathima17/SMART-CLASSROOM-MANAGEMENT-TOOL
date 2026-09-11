import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public Landing Page
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing-page.component').then(m => m.LandingPageComponent)
  },

  // Auth Routes (Auth Layout)
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },

  // Teacher Workspace Routes
  {
    path: 'teacher',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard('teacher')],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/teacher/dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent)
      },
      {
        path: 'live-classroom',
        loadComponent: () =>
          import('./features/teacher/live-classroom/live-classroom.component').then(m => m.LiveClassroomComponent)
      },
      {
        path: 'classrooms',
        loadComponent: () =>
          import('./features/teacher/classrooms/teacher-classrooms.component').then(m => m.TeacherClassroomsComponent)
      },
      {
        path: 'polls',
        loadComponent: () =>
          import('./features/teacher/polls/teacher-polls.component').then(m => m.TeacherPollsComponent)
      },
      {
        path: 'polls/create',
        loadComponent: () =>
          import('./features/teacher/create-poll/create-poll.component').then(m => m.CreatePollComponent)
      },
      {
        path: 'polls/live',
        loadComponent: () =>
          import('./features/teacher/live-poll/live-poll.component').then(m => m.LivePollComponent)
      },
      {
        path: 'quizzes',
        loadComponent: () =>
          import('./features/teacher/quizzes/teacher-quizzes.component').then(m => m.TeacherQuizzesComponent)
      },
      {
        path: 'quizzes/create',
        loadComponent: () =>
          import('./features/teacher/create-quiz/create-quiz.component').then(m => m.CreateQuizComponent)
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/teacher/students/teacher-students.component').then(m => m.TeacherStudentsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/teacher/analytics/teacher-analytics.component').then(m => m.TeacherAnalyticsComponent)
      },
      {
        path: 'session-history',
        loadComponent: () =>
          import('./features/teacher/session-history/session-history.component').then(m => m.SessionHistoryComponent)
      },
      {
        path: 'leaderboard',
        loadComponent: () =>
          import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
      }
    ]
  },

  // Student Workspace Routes
  {
    path: 'student',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard('student')],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'join',
        loadComponent: () =>
          import('./features/student/join-classroom/join-classroom.component').then(m => m.JoinClassroomComponent)
      },
      {
        path: 'live-poll',
        loadComponent: () =>
          import('./features/student/live-poll/student-live-poll.component').then(m => m.StudentLivePollComponent)
      },
      {
        path: 'quizzes',
        loadComponent: () =>
          import('./features/student/quizzes/student-quizzes.component').then(m => m.StudentQuizzesComponent)
      },
      {
        path: 'quizzes/take/:id',
        loadComponent: () =>
          import('./features/student/quiz-runner/quiz-runner.component').then(m => m.QuizRunnerComponent)
      },
      {
        path: 'quizzes/result/:id',
        loadComponent: () =>
          import('./features/student/quiz-result/quiz-result.component').then(m => m.QuizResultComponent)
      },
      {
        path: 'participation',
        loadComponent: () =>
          import('./features/student/participation/student-participation.component').then(m => m.StudentParticipationComponent)
      },
      {
        path: 'leaderboard',
        loadComponent: () =>
          import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
      }
    ]
  },

  // Admin Workspace Routes
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard('admin')],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'classrooms',
        loadComponent: () =>
          import('./features/admin/classrooms/admin-classrooms.component').then(m => m.AdminClassroomsComponent)
      }
    ]
  },

  // Fallback Wildcard
  {
    path: '**',
    redirectTo: ''
  }
];
