"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  newsletterSchema,
  type NewsletterInput,
} from "@/validations/newsletter";

export function NewsletterForm() {
  const isSubmittingRef = useRef(false);

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
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const result = await subscribeToNewsletter(data);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Successfully subscribed!");
      reset();
    } catch {
      toast.error("Failed to subscribe. Please try again later.");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  const pending = isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-md space-y-3"
      noValidate
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={pending}
          {...register("email")}
        />
        <Button type="submit" disabled={pending} className="sm:shrink-0">
          {pending ? (
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
    </form>
  );
}
