import { AppHeader } from "@/components/shared/app-header";
import { PageContainer } from "@/components/shared/page-container";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        trailing={
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      />
      <PageContainer className="flex max-w-md flex-col gap-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Forgot password</h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email and we will send reset instructions once Supabase Auth is connected.
          </p>
        </div>
        <ForgotPasswordForm />
      </PageContainer>
    </div>
  );
}
