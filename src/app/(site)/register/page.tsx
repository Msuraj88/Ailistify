import { RegisterForm } from "@/components/auth/register-form";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Create Account",
  description: "Create your AIListify account to submit and bookmark AI tools.",
});

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  );
}
