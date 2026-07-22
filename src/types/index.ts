import type { UserRole, StudentStatus, ApplicationStatus, DocumentStatus } from "@prisma/client";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  mobile?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  status: StudentStatus;
  country: string | null;
  preferredCountry: string | null;
  preferredUniversity: string | null;
  preferredCourse: string | null;
  interests: string[];
  hobbies: string[];
}

export interface UniversityListItem {
  id: string;
  name: string;
  country: string;
  city: string | null;
  ranking: number | null;
  coursesCount?: number;
}

export interface CourseListItem {
  id: string;
  name: string;
  level: string;
  category: string;
  university: string | null;
  country: string;
  tuitionFeeMin: number | null;
  tuitionFeeMax: number | null;
}

export interface DocumentItem {
  id: string;
  type: string;
  status: DocumentStatus;
  fileName: string;
  version: number;
  createdAt: string;
}

export interface ApplicationItem {
  id: string;
  university: string;
  course: string | null;
  status: ApplicationStatus;
  intake: string | null;
  submittedAt: string | null;
}

export interface DashboardStats {
  totalStudents: number;
  activeApplications: number;
  documentsPending: number;
  pendingReviews: number;
}
