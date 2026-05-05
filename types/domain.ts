export type UserRole = "admin" | "teacher" | "parent";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  initials: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AttendanceStatus = "present" | "absent" | "late";

export type ExcuseStatus = "pending" | "approved" | "rejected";
