import { AppHeader } from "@/components/shared/app-header";
import { buttonClassName } from "@/components/shared/button";
import { PageContainer } from "@/components/shared/page-container";
import Link from "next/link";

export const metadata = {
  title: "Unauthorized",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        trailing={
          <Link href="/login" className={buttonClassName({ variant: "secondary", size: "sm" })}>
            Sign in
          </Link>
        }
      />
      <PageContainer className="max-w-lg py-16">
        <h1 className="text-2xl font-semibold text-foreground">Unauthorized</h1>
        <p className="mt-3 text-sm text-muted">
          You do not have access to this area. If you are signed in with the wrong role, switch accounts or contact an
          administrator.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className={buttonClassName({ variant: "secondary", size: "sm" })}>
            Home
          </Link>
          <Link href="/login" className={buttonClassName({ variant: "primary", size: "sm" })}>
            Sign in
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
