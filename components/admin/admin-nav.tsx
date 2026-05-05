import type { TabItem } from "@/components/shared/tab-navigation";

/** Primary admin navigation — small operational portal (Komunitní skupina). */
export const ADMIN_NAV: TabItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/parents", label: "Parents" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/timetable", label: "Timetable" },
];
