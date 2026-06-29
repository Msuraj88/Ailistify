import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { createNoIndexMetadata } from "@/lib/metadata";
import { isGoogleAuthEnabled } from "@/lib/auth/oauth";

export const metadata = createNoIndexMetadata({
  title: "Sign In",
  description: "Sign in to your AIListify account.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Suspense
        fallback={<div className="text-muted-foreground">Loading...</div>}
      >
        <LoginForm googleAuthEnabled={isGoogleAuthEnabled()} />
      </Suspense>
    </div>
  );
}
