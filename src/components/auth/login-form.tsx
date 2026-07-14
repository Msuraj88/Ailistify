"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { AuthDivider } from "@/components/auth/auth-divider";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/validations/auth";
import { normalizeCallbackUrl } from "@/lib/auth/callback-url";
import { cn } from "@/lib/utils";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  OAuthAccountNotLinked:
    "This email is already registered with a password. Sign in with email and password instead.",
  OAuthSignin: "Google sign-in failed. Please try again.",
  Configuration:
    "Google sign-in is not configured yet. Add your OAuth credentials to continue.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Default: "Something went wrong during sign-in. Please try again.",
};

function getAuthErrorMessage(error: string | null): string | null {
  if (!error) {
    return null;
  }

  return AUTH_ERROR_MESSAGES[error] ?? AUTH_ERROR_MESSAGES.Default;
}

type LoginFormProps = {
  googleAuthEnabled?: boolean;
  variant?: "page" | "modal";
  callbackUrl?: string;
  onSuccess?: () => void;
};

export function LoginForm({
  googleAuthEnabled = false,
  variant = "page",
  callbackUrl: callbackUrlProp,
  onSuccess,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = normalizeCallbackUrl(
    callbackUrlProp ?? searchParams.get("callbackUrl") ?? "/",
  );
  const urlError = searchParams.get("error");

  const [serverError, setServerError] = useState<string | null>(
    getAuthErrorMessage(urlError),
  );
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isModal = variant === "modal";
  const registerHref = `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    setSuccess(false);

    const result = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Invalid email or password. Please try again.");
      return;
    }

    setSuccess(true);
    onSuccess?.();
    router.push(callbackUrl);
    router.refresh();
  }

  const header = (
    <div className={cn("space-y-1", isModal ? "text-center" : "text-center")}>
      <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
      <p className="text-sm text-muted-foreground">
        Sign in to your AIListify account to continue
      </p>
    </div>
  );

  const body = (
    <>
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="rounded-md border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-primary"
        >
          Login successful. Redirecting...
        </div>
      )}

      {googleAuthEnabled && (
        <>
          <GoogleSignInButton callbackUrl={callbackUrl} />
          <AuthDivider />
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor={isModal ? "modal-email" : "email"}>Email</Label>
        <Input
          id={isModal ? "modal-email" : "email"}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={isModal ? "modal-password" : "password"}>
          Password
        </Label>
        <Input
          id={isModal ? "modal-password" : "password"}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isSubmitting}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
    </>
  );

  const footer = (
    <>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={registerHref}
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  );

  if (isModal) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
        <div className="space-y-6 px-6 pb-2 pt-8">{header}</div>
        <div className="space-y-4 px-6 py-2">{body}</div>
        <div className="flex flex-col gap-4 px-6 pb-8 pt-4">{footer}</div>
      </form>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your AIListify account to continue
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">{body}</CardContent>
        <CardFooter className="flex flex-col gap-4">{footer}</CardFooter>
      </form>
    </Card>
  );
}
