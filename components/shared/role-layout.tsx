import { AppHeader } from "@/components/shared/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { TabNavigation, type TabItem } from "@/components/shared/tab-navigation";
import type { UserRole } from "@/types/domain";
import type { ReactNode } from "react";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  teacher: "Teacher",
  parent: "Parent",
};

export type RoleLayoutProps = {
  role: UserRole;
  userName: string;
  tabs: TabItem[];
  children: ReactNode;
  onLogout?: () => void;
};

export function RoleLayout({ role, userName, tabs, children, onLogout }: RoleLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        userName={userName}
        roleLabel={roleLabels[role]}
        showAuthSection
        onLogout={onLogout}
      />
      <PageContainer className="space-y-6 py-8">
        <TabNavigation items={tabs} />
        {children}
      </PageContainer>
    </div>
  );
}
