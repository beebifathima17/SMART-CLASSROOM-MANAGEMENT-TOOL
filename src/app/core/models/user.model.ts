export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  institution?: string;
  department?: string;
  joinedDate: string;
  status: 'active' | 'inactive';
}

export interface AuthSession {
  user: User;
  token: string;
}
