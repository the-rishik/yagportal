export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  pronouns?: string;
  namePronunciation?: string;
  phoneNumber: string;
  role: 'user' | 'advisor' | 'staff' | 'admin';
  school?: string;
  createdAt: string;
  updatedAt: string;
  mustChangePassword?: boolean;
  mustCompleteProfile?: boolean;
}

export interface Bill {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    school?: string;
  };
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  category: string;
  school: string;
  comments: Array<{
    _id: string;
    author: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  author: User;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  pronouns?: string;
  namePronunciation?: string;
  phoneNumber: string;
  school: string;
}

export interface BillFormData {
  title: string;
  content: string;
  category: 'education' | 'environment' | 'health' | 'public_safety' | 'other';
}

export interface RoleChangeRequest {
  role: 'user' | 'advisor' | 'staff' | 'admin';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Person {
  id?: string;
  name: string;
  email: string;
  gender: string;
  type: 'student' | 'advisor';
}

export interface School {
  _id: string;
  schoolName: string;
  numberOfStudents: number;
  people: Person[];
  status: 'pending' | 'approved';
  registeredBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
} 