import { AppHeader } from "@/components/shared/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { getCurrentProfile } from "@/lib/auth/session";
import { roleRedirectPath } from "@/lib/auth/redirects";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  if (profile?.is_active) {
    redirect(roleRedirectPath(profile.role));
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        trailing={
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            Back to home
          </Link>
        }
      />
      <PageContainer className="flex max-w-md flex-col gap-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Use your school email and password.</p>
        </div>
        <LoginForm />
      </PageContainer>
    </div>
  );
}
