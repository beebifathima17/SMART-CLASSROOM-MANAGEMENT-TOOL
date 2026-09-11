# SmartClass – Smart Classroom Engagement Tool
> A modern, professional SaaS-style interactive classroom participation platform built with Angular, TypeScript, Reactive Forms, Chart.js, and a bespoke design system.

---

## 🌟 Overview & Key Features

SmartClass is designed for university and college lectures to transform traditional classrooms into interactive, synchronous learning environments.

- **Role-Based Portals**: Tailored interfaces for **Teachers**, **Students**, and **Administrators**.
- **Live Classroom Hub**: Real-time room management (`WT7K92` for Web Technologies `WT301`), attendance tracker, and live student participation status (Active, Answered, Not Responded, Idle).
- **Interactive Live Polling**: Multi-choice, Yes/No, 1–5 Star Rating, and Open-Text polls with countdown timers, dynamic vote distribution charts, and student results toggles.
- **Quiz Builder & Timed Runner**: Multi-question assessment creation with marks, correct-answer evaluation, auto-scoring, confetti celebration, and question-by-question review.
- **Analytics & Export Suite**: Participation trend charts over lecture sessions, topic mastery breakdowns, student roster tables, and **1-click CSV & PDF report downloads**.
- **Instant 1-Click Demo Logins**: Preloaded demo profiles (`Dr. Priya Sharma`, `Aisha Khan`, `Academic Administrator`) with cross-role switching.

---

## 🚀 Getting Started & Running Locally

### 1. Prerequisites
- **Node.js**: v18.x or higher (Node v20+ recommended)
- **npm**: v9.x or higher
- **Angular CLI** (Optional global install: `npm install -g @angular/cli`)

### 2. Install Dependencies
Run the following command in the project root directory:
```bash
npm install
```
*(If encountering dependency conflicts with modern npm, use `npm install --legacy-peer-deps`)*

### 3. Start the Development Server
```bash
npm start
# or
npx ng serve
```

### 4. Open in Browser
Navigate to:
```
http://localhost:4200
```
The application will automatically reload whenever you change any source files.

---

## 📂 Project Structure

```
smart-classroom-engagement-tool/
├── angular.json                       # Angular CLI workspace & budget configurations
├── package.json                       # Dependencies (Angular, Chart.js, canvas-confetti, etc.)
├── tsconfig.json                      # TypeScript configuration
├── public/                            # Static assets and icons
└── src/
    ├── index.html                     # HTML root with Plus Jakarta Sans & Space Grotesk fonts
    ├── styles.css                     # Comprehensive design system (CSS variables, buttons, tables, badges)
    ├── main.ts                        # Application bootstrap entry point
    └── app/
        ├── app.routes.ts              # Route registry with AuthGuard & RoleGuards
        ├── app.config.ts              # Angular application providers
        ├── app.ts / app.html          # Root application shell with router-outlet
        │
        ├── core/                      # Core singleton services, guards, and TypeScript models
        │   ├── guards/
        │   │   ├── auth.guard.ts      # Verifies active session
        │   │   └── role.guard.ts      # Restricts teacher/student/admin routes
        │   ├── models/
        │   │   ├── user.model.ts      # User, UserRole, AuthSession interfaces
        │   │   ├── classroom.model.ts # Classroom, Session, EnrolledStudent interfaces
        │   │   ├── poll.model.ts      # Poll, PollOption, PollResponse interfaces
        │   │   ├── quiz.model.ts      # Quiz, QuizQuestion, QuizSubmission interfaces
        │   │   └── analytics.model.ts # AnalyticsSummary, SessionParticipation interfaces
        │   └── services/
        │       ├── auth.service.ts    # Authentication, role switching, demo presets
        │       ├── classroom.service.ts # Classroom state, room WT7K92, student feed
        │       ├── poll.service.ts    # Poll lifecycle, real-time voting calculations
        │       ├── quiz.service.ts    # Quiz creation, test grading, answer evaluation
        │       ├── student.service.ts # Student roster lookups & profile selection
        │       ├── analytics.service.ts # Chart aggregation, CSV and PDF report exporter
        │       └── toast.service.ts   # Reactive toast notifications
        │
        ├── shared/                    # Reusable UI components
        │   └── components/
        │       ├── icon/              # Standalone SVG Lucide-compatible icon library
        │       ├── stat-card/         # Metric cards with delta pills and icons
        │       ├── chart/             # Chart.js canvas component (Line, Bar, Doughnut)
        │       ├── modal/             # Accessible backdrop modal dialog
        │       ├── confirm-modal/     # Safety confirmation modal
        │       ├── empty-state/       # Clean illustration & CTA for empty lists
        │       ├── loading-spinner/   # Animated spinner
        │       ├── toast-container/   # Floating notification container
        │       └── student-detail-modal/ # Drill-down student engagement profile modal
        │
        ├── layout/                    # Layout shells
        │   ├── main-layout/           # Sidebar + Topbar + Notifications + Profile menu
        │   └── auth-layout/           # Centered authentication container
        │
        └── features/                  # Application feature modules
            ├── landing/               # Polished SaaS Landing page with interactive preview
            ├── auth/
            │   ├── login/             # Role tabs + 1-click Demo logins + Forgot password
            │   └── register/          # Form with role and institution validation
            ├── teacher/
            │   ├── dashboard/         # Professor Priya Sharma home with stats & charts
            │   ├── live-classroom/    # Teacher command center (Room WT7K92, roster statuses)
            │   ├── create-poll/       # Dynamic poll creator with student phone preview
            │   ├── live-poll/         # Real-time poll monitor with countdown & live chart
            │   ├── create-quiz/       # Multi-question assessment builder with marks & keys
            │   ├── analytics/         # Engagement charts, topic mastery, CSV/PDF export
            │   ├── students/          # Student roster with search & drill-down modals
            │   └── session-history/   # Previous lecture logs & breakdown modals
            ├── student/
            │   ├── dashboard/         # Aisha Khan student portal & active class card
            │   ├── join-classroom/    # Large PIN keypad input & recently joined rooms
            │   ├── live-poll/         # Real-time voting with live chart reveal
            │   ├── quiz-runner/       # Timed exam test taker with progress bar
            │   ├── quiz-result/       # Score summary, confetti, and solution reviews
            │   └── participation/     # Personal attendance and score progression
            └── admin/
                ├── dashboard/         # Institutional KPI overview & user growth charts
                ├── users/             # User management table with activate/deactivate & add modal
                └── classrooms/        # Institutional classrooms directory
```

---

## 🧭 How Routing & Guards Work

The application routes are registered in [`src/app/app.routes.ts`](file:///c:/Users/beebi/OneDrive/Desktop/codesight/smart%20classroom%20engagement%20tool/src/app/app.routes.ts):

1. **Public Routes**:
   - `/`: Landing page.
   - `/login`, `/register`: Auth pages wrapped in `AuthLayoutComponent`.
2. **Protected Role Routes**:
   - `/teacher/**`: Protected by `canActivate: [authGuard, roleGuard('teacher')]`.
   - `/student/**`: Protected by `canActivate: [authGuard, roleGuard('student')]`.
   - `/admin/**`: Protected by `canActivate: [authGuard, roleGuard('admin')]`.
3. **Demo Quick Switcher**:
   - The sidebar has a built-in **"Demo Role Switcher"** allowing instant switching between Teacher (`Dr. Priya Sharma`), Student (`Aisha Khan`), and Admin without retyping credentials.

---

## 💾 Mock Data Architecture & State Management

All data is managed reactively via **Angular Signals** and structured TypeScript services:
- **`AuthService`**: Persists the session in `localStorage` so page refreshes maintain the user state.
- **`PollService`**: Manages vote counters and automatically computes dynamic option percentages whenever a vote is cast.
- **`QuizService`**: Automatically scores student answers against correct keys upon submission.
- **`ClassroomService`**: Tracks connected students, live participation statuses, and activity stream feeds.

---

## 🔌 Future Backend (Express.js) & Database (MongoDB) Integration

This frontend has been built with clean service abstractions to ensure **zero frontend refactoring** when connecting an Express.js & MongoDB backend:

### 1. Connecting Express.js REST APIs
In [`src/app/core/services/`](file:///c:/Users/beebi/OneDrive/Desktop/codesight/smart%20classroom%20engagement%20tool/src/app/core/services/), replace local signal updates with Angular's `HttpClient`:

```typescript
// Example: In poll.service.ts
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PollService {
  private apiUrl = 'http://localhost:5000/api/polls';
  constructor(private http: HttpClient) {}

  createPoll(pollData: any): Observable<Poll> {
    return this.http.post<Poll>(`${this.apiUrl}/create`, pollData);
  }

  submitVote(pollId: string, payload: any): Observable<PollResponse> {
    return this.http.post<PollResponse>(`${this.apiUrl}/${pollId}/vote`, payload);
  }
}
```

### 2. Mapping to MongoDB Collections
The TypeScript models map directly 1-to-1 with Mongoose schemas:
- **`User`** (`user.model.ts`) ➔ `users` collection (`name`, `email`, `role`, `passwordHash`, `institution`).
- **`Classroom`** (`classroom.model.ts`) ➔ `classrooms` collection (`name`, `courseCode`, `roomCode`, `teacherId`).
- **`Poll`** (`poll.model.ts`) ➔ `polls` collection (`classroomId`, `question`, `type`, `options: [{ text, votes }]`, `status`).
- **`Quiz`** (`quiz.model.ts`) ➔ `quizzes` collection (`classroomId`, `title`, `questions: [{ questionText, options, correctOptionId, marks }]`).
- **`QuizSubmission`** (`quiz.model.ts`) ➔ `quiz_submissions` collection (`quizId`, `studentId`, `score`, `answers`).
- **`ClassroomSession`** (`classroom.model.ts`) ➔ `sessions` collection (`classroomId`, `sessionNumber`, `date`, `participationPercentage`).

---

## 🎯 Academic Project Presentation Checklist
- [x] **Polished Modern SaaS Design System** (slate neutrals, indigo accents, rounded cards, subtle shadows).
- [x] **Complete Role Separation** (Teacher, Student, Admin).
- [x] **All Routes & Navigation Fully Functional** (0 broken links, 0 placeholder pages).
- [x] **Live Interactive Charts** (Line, Bar, Doughnut via Chart.js).
- [x] **Interactive Demos** (Cast live votes, submit quizzes with instant scoring & confetti, export CSVs).
- [x] **Clean Angular Build** (`npx ng build` compiles with 0 errors).
