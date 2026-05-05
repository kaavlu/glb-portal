"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/shared/input";
import { loginWithPasswordAction } from "@/lib/actions/auth-login";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    const result = await loginWithPasswordAction({
      email: values.email,
      password: values.password,
    });
    if (result?.error) {
      toast.error(result.error);
    }
  };

  return (
    <Card className="p-6 sm:p-8">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          suffix={
            <button
              type="button"
              className="rounded-md p-1.5 text-muted hover:bg-background hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((open) => !open)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register("password")}
          type={showPassword ? "text" : "password"}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password
          </Link>
          <Button type="submit" disabled={isSubmitting} className="sm:min-w-[8rem]">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>

      <details className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <summary className="cursor-pointer font-medium text-foreground">Demo seed accounts</summary>
        <p className="mt-2 text-xs text-muted">
          Credentials from development seed data (supabase/seed.sql). Remove this panel before production.
        </p>
        <ul className="mt-3 space-y-2.5 font-mono text-xs text-foreground">
          <li>
            <span className="font-sans font-medium text-muted">Admin — </span>
            admin@gybassi.cz / GLBAdmin2026!
          </li>
          <li>
            <span className="font-sans font-medium text-muted">Teacher — </span>
            marek.lnenicka@gybassi.cz / GLBTeacher2026!
          </li>
        </ul>
      </details>
    </Card>
  );
}
