import axios from 'axios';
import { 
  User, 
  Bill, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  BillFormData,
  RoleChangeRequest
} from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<{ user: User }>('/auth/me');
    return response.data.user;
  }

  // Bills endpoints
  async getBills(): Promise<Bill[]> {
    const response = await this.api.get<Bill[]>('/bills');
    return response.data;
  }

  async getBill(id: string): Promise<Bill> {
    const response = await this.api.get<Bill>(`/bills/${id}`);
    return response.data;
  }

  async createBill(billData: BillFormData): Promise<Bill> {
    const response = await this.api.post<Bill>('/bills', billData);
    return response.data;
  }

  async updateBill(id: string, billData: Partial<BillFormData>): Promise<Bill> {
    const response = await this.api.put<Bill>(`/bills/${id}`, billData);
    return response.data;
  }

  async deleteBill(id: string): Promise<void> {
    await this.api.delete(`/bills/${id}`);
  }

  async submitBill(id: string): Promise<Bill> {
    const response = await this.api.post<Bill>(`/bills/${id}/submit`);
    return response.data;
  }

  // Admin endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.api.get<User[]>('/admin/users');
    return response.data;
  }

  async getAdminBills(): Promise<Bill[]> {
    const response = await this.api.get<Bill[]>('/admin/bills');
    return response.data;
  }

  async changeUserRole(userId: string, roleData: RoleChangeRequest): Promise<User> {
    const response = await this.api.post<{ user: User }>(`/admin/change-role/${userId}`, roleData);
    return response.data.user;
  }

  async promoteUser(userId: string): Promise<User> {
    const response = await this.api.post<{ user: User }>(`/admin/promote/${userId}`);
    return response.data.user;
  }

  async searchBills(query: string): Promise<Bill[]> {
    const response = await this.api.get<Bill[]>(`/admin/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // School management endpoints
  async getSchools(): Promise<any[]> {
    const response = await this.api.get<any[]>('/admin/schools');
    return response.data;
  }

  async approveSchool(schoolId: string): Promise<any> {
    const response = await this.api.put<any>(`/admin/schools/${schoolId}/approve`);
    return response.data;
  }

  async updateSchool(schoolId: string, schoolData: any): Promise<any> {
    const response = await this.api.put<any>(`/admin/schools/${schoolId}`, schoolData);
    return response.data;
  }

  async deleteSchool(schoolId: string): Promise<any> {
    const response = await this.api.delete<any>(`/admin/schools/${schoolId}`);
    return response.data;
  }

  // Generic HTTP methods
  async get<T>(url: string): Promise<T> {
    const response = await this.api.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }

  async updateProfile(profileData: {
    firstName: string;
    lastName: string;
    middleName?: string;
    pronouns?: string;
    namePronunciation?: string;
    phoneNumber: string;
    foodAllergies?: string;
    tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
      email: string;
    };
  }): Promise<{ user: User; message: string }> {
    const response = await this.api.patch<{ user: User; message: string }>('/auth/update-profile', profileData);
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<any> {
    return this.post<any>('/auth/change-password', { oldPassword, newPassword, confirmPassword });
  }

  // New comprehensive account update method
  async updateAccount(accountData: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    pronouns?: string;
    namePronunciation?: string;
    phoneNumber?: string;
    foodAllergies?: string;
    tshirtSize?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
    emergencyContact?: {
      name: string;
      relationship: string;
      phoneNumber: string;
      email: string;
    };
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }): Promise<{ user: User; message: string }> {
    const response = await this.api.patch<{ user: User; message: string }>('/auth/account', accountData);
    return response.data;
  }

  // Get approved schools for registration
  async getApprovedSchools(): Promise<{ schoolName: string }[]> {
    const response = await this.api.get<{ schoolName: string }[]>('/auth/approved-schools');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 