import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseSchema, User, Classroom, Poll, Quiz } from '../models/types';

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const getInitialSeed = (): DatabaseSchema => {
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  const seedUsers: User[] = [
    {
      id: 'usr-teacher-01',
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@smartclass.edu',
      password: hashedPassword,
      role: 'teacher',
      department: 'Computer Science',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: now
    },
    {
      id: 'usr-student-01',
      name: 'Aisha Khan',
      email: 'aisha.khan@smartclass.edu',
      password: hashedPassword,
      role: 'student',
      studentId: 'CS2026-042',
      department: 'Computer Science',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: now
    },
    {
      id: 'usr-student-02',
      name: 'Rahul Verma',
      email: 'rahul.verma@smartclass.edu',
      password: hashedPassword,
      role: 'student',
      studentId: 'CS2026-088',
      department: 'Computer Science',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: now
    },
    {
      id: 'usr-admin-01',
      name: 'System Admin',
      email: 'admin@smartclass.edu',
      password: hashedPassword,
      role: 'admin',
      department: 'Administration',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: now
    }
  ];

  const seedClassroom: Classroom = {
    id: 'cls-wt-01',
    name: 'Web Technologies',
    courseCode: 'WT04',
    section: 'CS-A',
    teacherId: 'usr-teacher-01',
    teacherName: 'Dr. Priya Sharma',
    roomCode: 'WT04',
    isLive: true,
    startedAt: '10:00 AM',
    schedule: 'Mon, Wed, Fri • 10:00 AM – 11:00 AM',
    roomLocation: 'Lecture Hall 1 & Virtual',
    enrolledStudentsCount: 2,
    createdAt: now
  };

  const seedPolls: Poll[] = [
    {
      id: 'poll-01',
      classroomId: 'cls-wt-01',
      title: 'Angular Signals vs RxJS Observables',
      question: 'Which reactive state primitive provides cleaner developer ergonomics in Angular 19+ apps?',
      type: 'multiple-choice',
      options: [
        { id: 'opt-1', text: 'Angular Signals (Fine-grained reactivity)', votes: 8 },
        { id: 'opt-2', text: 'RxJS BehaviorSubjects / Observables', votes: 4 },
        { id: 'opt-3', text: 'Hybrid RxJS + Signals toSignal()', votes: 12 },
        { id: 'opt-4', text: 'Traditional Component State Properties', votes: 1 }
      ],
      status: 'active',
      totalResponses: 25,
      createdById: 'usr-teacher-01',
      createdAt: 'Today, 10:15 AM'
    },
    {
      id: 'poll-02',
      classroomId: 'cls-wt-01',
      title: 'HTTP/2 vs WebSockets',
      question: 'For low-latency bidirectional real-time classroom telemetry, which transport layer is best suited?',
      type: 'multiple-choice',
      options: [
        { id: 'opt-21', text: 'WebSockets (Full duplex TCP)', votes: 18 },
        { id: 'opt-22', text: 'Server-Sent Events (SSE)', votes: 5 },
        { id: 'opt-23', text: 'Short Polling HTTP/1.1', votes: 0 }
      ],
      status: 'draft',
      totalResponses: 23,
      createdById: 'usr-teacher-01',
      createdAt: 'Yesterday'
    }
  ];

  const seedQuizzes: Quiz[] = [
    {
      id: 'quiz-01',
      classroomId: 'cls-wt-01',
      title: 'Modern Web Architecture & REST Principles',
      description: 'Test your understanding of REST verbs, idempotent operations, and reactive state management.',
      subject: 'Web Technologies',
      durationMinutes: 15,
      totalMarks: 30,
      totalQuestions: 3,
      status: 'published',
      createdById: 'usr-teacher-01',
      completedCount: 18,
      averageScore: 84,
      createdAt: 'Today, 09:30 AM',
      questions: [
        {
          id: 'q-1',
          question: 'Which HTTP method is idempotent and used to replace an entire target resource?',
          options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
          correctOptionIndex: 1,
          marks: 10,
          explanation: 'PUT replaces the entire entity at the target URI and is idempotent by RFC 7231 standards.'
        },
        {
          id: 'q-2',
          question: 'What is the primary architectural benefit of Standalone Components in modern Angular?',
          options: [
            'Removes unnecessary NgModule boilerplate and enables fine-grained lazy loading',
            'Makes components run outside the browser',
            'Disables TypeScript strict mode',
            'Forces server-side rendering on every request'
          ],
          correctOptionIndex: 0,
          marks: 10,
          explanation: 'Standalone components simplify module graphs and reduce bundle payload.'
        },
        {
          id: 'q-3',
          question: 'In WebSockets, which protocol upgrade header initiates the duplex connection?',
          options: ['Upgrade: websocket', 'Connection: close', 'Accept: application/json', 'Transfer-Encoding: chunked'],
          correctOptionIndex: 0,
          marks: 10,
          explanation: 'HTTP 101 Switching Protocols with Upgrade: websocket establishes duplex TCP connection.'
        }
      ]
    }
  ];

  return {
    users: seedUsers,
    classrooms: [seedClassroom],
    joinRequests: [],
    members: [
      {
        id: 'mem-01',
        classroomId: 'cls-wt-01',
        studentId: 'usr-student-01',
        studentName: 'Aisha Khan',
        studentEmail: 'aisha.khan@smartclass.edu',
        joinedAt: now,
        isOnline: true,
        participationPercentage: 92
      },
      {
        id: 'mem-02',
        classroomId: 'cls-wt-01',
        studentId: 'usr-student-02',
        studentName: 'Rahul Verma',
        studentEmail: 'rahul.verma@smartclass.edu',
        joinedAt: now,
        isOnline: true,
        participationPercentage: 86
      }
    ],
    polls: seedPolls,
    pollVotes: [],
    quizzes: seedQuizzes,
    quizSubmissions: [],
    activityLogs: [
      {
        id: 'act-01',
        classroomId: 'cls-wt-01',
        userId: 'usr-teacher-01',
        userName: 'Dr. Priya Sharma',
        type: 'alert',
        message: 'Dr. Priya Sharma started live session for Web Technologies (WT04)',
        badgeType: 'primary',
        timestamp: '10:00 AM'
      },
      {
        id: 'act-02',
        classroomId: 'cls-wt-01',
        userId: 'usr-student-01',
        userName: 'Aisha Khan',
        type: 'join',
        message: 'Aisha Khan connected to classroom WT04',
        badgeType: 'success',
        timestamp: '10:02 AM'
      }
    ]
  };
};

class JsonDatabase {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = getInitialSeed();
      this.save(initialData);
      return initialData;
    }

    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('[DB] Error reading database file, restoring defaults:', err);
      const initialData = getInitialSeed();
      this.save(initialData);
      return initialData;
    }
  }

  private save(data?: DatabaseSchema): void {
    const toWrite = data || this.db;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(toWrite, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error writing to database file:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.db[collection];
  }

  public update<K extends keyof DatabaseSchema>(collection: K, updater: (items: DatabaseSchema[K]) => DatabaseSchema[K]): DatabaseSchema[K] {
    this.db[collection] = updater(this.db[collection]);
    this.save();
    return this.db[collection];
  }

  public commit(): void {
    this.save();
  }

  public raw(): DatabaseSchema {
    return this.db;
  }
}

export const db = new JsonDatabase();
