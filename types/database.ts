export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "admin" | "teacher" | "parent";
          initials: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role: "admin" | "teacher" | "parent";
          initials?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: "admin" | "teacher" | "parent";
          initials?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          name: string;
          school_year: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          school_year?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          school_year?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          full_name: string;
          initials: string | null;
          class_id: string | null;
          language_group: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          initials?: string | null;
          class_id?: string | null;
          language_group?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          initials?: string | null;
          class_id?: string | null;
          language_group?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
        ];
      };
      parent_students: {
        Row: {
          parent_id: string;
          student_id: string;
          relationship: string | null;
          created_at: string;
        };
        Insert: {
          parent_id: string;
          student_id: string;
          relationship?: string | null;
          created_at?: string;
        };
        Update: {
          parent_id?: string;
          student_id?: string;
          relationship?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "parent_students_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "parent_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          full_name: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          full_name?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          full_name?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      teacher_assignments: {
        Row: {
          id: string;
          teacher_id: string;
          class_id: string;
          subject_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          class_id: string;
          subject_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          class_id?: string;
          subject_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      class_schedules: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          day_of_week: number;
          period_number?: number | null;
          start_time: string;
          end_time: string;
          room?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          subject_id?: string;
          teacher_id?: string;
          day_of_week?: number;
          period_number?: number | null;
          start_time?: string;
          end_time?: string;
          room?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_schedules_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_schedules_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      class_sessions: {
        Row: {
          id: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          schedule_id: string | null;
          session_date: string;
          start_time: string | null;
          end_time: string | null;
          status: "open" | "completed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          schedule_id?: string | null;
          session_date: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: "open" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          subject_id?: string;
          teacher_id?: string;
          schedule_id?: string | null;
          session_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: "open" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_sessions_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_sessions_schedule_id_fkey";
            columns: ["schedule_id"];
            isOneToOne: false;
            referencedRelation: "class_schedules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_sessions_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_sessions_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance_records: {
        Row: {
          id: string;
          session_id: string;
          student_id: string;
          status: "present" | "absent" | "late";
          recorded_by: string | null;
          recorded_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          status: "present" | "absent" | "late";
          recorded_by?: string | null;
          recorded_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          student_id?: string;
          status?: "present" | "absent" | "late";
          recorded_by?: string | null;
          recorded_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_records_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "class_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_records_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_logs: {
        Row: {
          id: string;
          session_id: string;
          teacher_id: string;
          topic: string | null;
          content: string;
          homework: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          teacher_id: string;
          topic?: string | null;
          content: string;
          homework?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          teacher_id?: string;
          topic?: string | null;
          content?: string;
          homework?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_logs_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: true;
            referencedRelation: "class_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_logs_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      excuse_requests: {
        Row: {
          id: string;
          attendance_record_id: string;
          student_id: string;
          parent_id: string;
          reason_category: "medical" | "family" | "travel" | "other";
          description: string | null;
          status: "pending" | "approved" | "rejected";
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          attendance_record_id: string;
          student_id: string;
          parent_id: string;
          reason_category: "medical" | "family" | "travel" | "other";
          description?: string | null;
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          attendance_record_id?: string;
          student_id?: string;
          parent_id?: string;
          reason_category?: "medical" | "family" | "travel" | "other";
          description?: string | null;
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "excuse_requests_attendance_record_id_fkey";
            columns: ["attendance_record_id"];
            isOneToOne: false;
            referencedRelation: "attendance_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "excuse_requests_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "excuse_requests_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "excuse_requests_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          student_id: string | null;
          type:
            | "absence_recorded"
            | "excuse_submitted"
            | "excuse_approved"
            | "excuse_rejected"
            | "system";
          title: string | null;
          message: string;
          status: "info" | "pending" | "success" | "error";
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          student_id?: string | null;
          type:
            | "absence_recorded"
            | "excuse_submitted"
            | "excuse_approved"
            | "excuse_rejected"
            | "system";
          title?: string | null;
          message: string;
          status?: "info" | "pending" | "success" | "error";
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          student_id?: string | null;
          type?:
            | "absence_recorded"
            | "excuse_submitted"
            | "excuse_approved"
            | "excuse_rejected"
            | "system";
          title?: string | null;
          message?: string;
          status?: "info" | "pending" | "success" | "error";
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_role: { Args: Record<PropertyKey, never>; Returns: string | null };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      parent_has_student: { Args: { p_parent: string; p_student: string }; Returns: boolean };
      teacher_assigned_to_student: { Args: { p_teacher: string; p_student: string }; Returns: boolean };
      teacher_teaches_class_subject: {
        Args: { p_teacher: string; p_class: string; p_subject: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type DbRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
