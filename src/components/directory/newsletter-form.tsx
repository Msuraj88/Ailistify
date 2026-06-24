"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { subscribeNewsletter } from "@/actions/directory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSchema, type NewsletterInput } from "@/validations";

export function NewsletterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: NewsletterInput) {
    setServerError(null);
    setSuccessMessage(null);

    const result = await subscribeNewsletter(data.email);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccessMessage("You're subscribed! Watch your inbox for updates.");
    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-md space-y-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isSubmitting}
          {...register("email")}
        />
        <Button type="submit" disabled={isSubmitting} className="sm:shrink-0">
          {isSubmitting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Subscribe
            </>
          )}
        </Button>
      </div>
      {errors.email && (
        <p className="text-sm text-destructive">{errors.email.message}</p>
      )}
      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}
      {successMessage && (
        <p className="text-sm text-primary" role="status">
          {successMessage}
        </p>
      )}
    </form>
  );
}
