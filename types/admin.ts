import type { AttendanceStatus, ExcuseStatus } from "@/types/domain";

export type AdminDashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalGroups: number;
  primaryGroupName: string | null;
  weeklySessions: number;
  parentLinksMissing: number;
  studentsByLanguage: {
    fj1: number;
    sj1: number;
    nj1: number;
    allMainClasses: number;
  };
};

export type AdminSeedHealth = {
  parentDataMissing: boolean;
  studentsWithoutLinkedParents: number;
  fj1Normalized: boolean;
  techNormalized: boolean;
  singleGroupMode: string | null;
};

export type RecentAbsenceRow = {
  id: string;
  recordedAt: string;
  studentName: string;
  className: string;
  subjectName: string;
  sessionDate: string;
  status: AttendanceStatus;
};

export type RecentLessonLogRow = {
  id: string;
  updatedAt: string;
  topic: string | null;
  className: string;
  subjectName: string;
  teacherName: string;
  sessionDate: string;
};

export type RecentExcuseRow = {
  id: string;
  createdAt: string;
  studentName: string;
  className: string | null;
  status: ExcuseStatus;
  reasonCategory: string;
};

export type TeacherListRow = {
  id: string;
  full_name: string;
  email: string;
  initials: string | null;
  phone: string | null;
  is_active: boolean;
  assignedSubjects: string;
  isCoTeacher: boolean;
};

export type ParentListRow = {
  id: string;
  full_name: string;
  email: string;
  initials: string | null;
  phone: string | null;
  is_active: boolean;
  linkedStudents: string;
};

export type StudentListRow = {
  id: string;
  full_name: string;
  initials: string | null;
  class_id: string | null;
  class_name: string | null;
  language_group: string | null;
  is_active: boolean;
  linkedParentsCount: number;
};

export type ClassListRow = {
  id: string;
  name: string;
  school_year: string | null;
  is_active: boolean;
  studentCount: number;
};

export type SubjectListRow = {
  id: string;
  name: string;
  full_name: string | null;
  notes: string | null;
  is_active: boolean;
  teachersSummary: string;
};

export type TeacherAssignmentListRow = {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  is_active: boolean;
  teacher_name: string;
  class_name: string;
  subject_name: string;
};

export type ClassScheduleListRow = {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  period_number: number | null;
  start_time: string;
  end_time: string;
  room: string | null;
  is_active: boolean;
  class_name: string;
  subject_name: string;
  subject_full_name: string | null;
  teacher_name: string;
};

export type ListStudentsFilters = {
  search?: string;
  classId?: string;
};

export type AdminAttendanceRow = {
  id: string;
  sessionDate: string;
  className: string;
  subjectName: string;
  studentName: string;
  status: AttendanceStatus;
  recordedByName: string | null;
  recordedAt: string;
  excuseStatus: string;
};

export type AdminAttendanceFilters = {
  date?: string;
  classId?: string;
  studentId?: string;
  teacherId?: string;
  status?: AttendanceStatus | "";
};

export type AdminLessonLogRow = {
  id: string;
  sessionDate: string;
  className: string;
  subjectName: string;
  teacherName: string;
  topic: string | null;
  updatedAt: string;
  content: string;
  homework: string | null;
  sessionId: string;
};

export type AdminLessonFilters = {
  date?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string;
};

export type AdminExcuseRow = {
  id: string;
  studentName: string;
  className: string | null;
  absenceDate: string;
  reasonCategory: string;
  description: string | null;
  parentName: string;
  status: ExcuseStatus;
  reviewedByName: string | null;
  reviewedAt: string | null;
};

export type AdminExcuseFilters = {
  status?: ExcuseStatus | "" | "all";
  studentId?: string;
  classId?: string;
};
