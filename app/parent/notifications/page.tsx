import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/require-role";
import { getParentNotifications } from "@/lib/data/parents";
import { formatDisplayDate } from "@/lib/utils/dates";
import { Bell, BellDot, CircleCheck, Clock3, TriangleAlert } from "lucide-react";

export const metadata = {
  title: "Notifications",
};

function NotificationIcon({ status }: { status: "info" | "pending" | "success" | "error" }) {
  if (status === "success") return <CircleCheck className="h-4 w-4 text-emerald-600" aria-hidden />;
  if (status === "pending") return <Clock3 className="h-4 w-4 text-amber-600" aria-hidden />;
  if (status === "error") return <TriangleAlert className="h-4 w-4 text-red-600" aria-hidden />;
  return <BellDot className="h-4 w-4 text-sky-600" aria-hidden />;
}

function mapTone(status: "info" | "pending" | "success" | "error"): "info" | "warning" | "success" | "error" {
  if (status === "pending") return "warning";
  return status;
}

function toLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function ParentNotificationsPage() {
  const profile = await requireRole("parent");
  const notifications = await getParentNotifications(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Recent Notifications</h1>
        <p className="mt-1 text-sm text-muted">Newest updates for your account and linked students.</p>
      </div>
      <Card className="p-6">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="Excuse updates, absence alerts, and system messages will show here."
          />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <article key={notification.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <NotificationIcon status={notification.status} />
                  <div className="space-y-1">
                    <p className="text-sm text-foreground">{notification.message}</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={mapTone(notification.status)}>{toLabel(notification.status)}</StatusBadge>
                      {notification.readAt ? (
                        <StatusBadge tone="neutral">Read</StatusBadge>
                      ) : (
                        <StatusBadge tone="warning">Unread</StatusBadge>
                      )}
                    </div>
                  </div>
                </div>
                <time className="shrink-0 text-xs text-muted" dateTime={notification.createdAt}>
                  {formatDisplayDate(notification.createdAt, "MMM d, yyyy")}
                </time>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
