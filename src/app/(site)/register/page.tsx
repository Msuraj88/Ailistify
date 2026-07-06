import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { createNoIndexMetadata } from "@/lib/metadata";
import { isGoogleAuthEnabled } from "@/lib/auth/oauth";

export const metadata = createNoIndexMetadata({
  title: "Create Account",
  description: "Create your AIListify account to submit and bookmark AI tools.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Suspense
        fallback={<div className="text-muted-foreground">Loading...</div>}
      >
        <RegisterForm googleAuthEnabled={isGoogleAuthEnabled()} />
      </Suspense>
    </div>
  );
}
