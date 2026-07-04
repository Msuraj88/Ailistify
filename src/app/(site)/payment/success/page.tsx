import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createNoIndexMetadata } from "@/lib/metadata";

export const metadata: Metadata = createNoIndexMetadata({
  title: "Payment Successful",
  description:
    "Your payment for AIListify promotion was successful. Your listing is now under review.",
  path: "/payment/success",
});

const nextSteps = [
  "We've received your payment.",
  "Your submission is now under review.",
  "Most listings are reviewed within 24–48 hours.",
  "We'll notify you by email once your listing is live.",
];

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-[20px] border border-gray-200/80 bg-white p-8 text-center sm:p-10">
        <p className="text-4xl" aria-hidden="true">
          🎉
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Payment Successful!
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Thank you for promoting your AI tool on AIListify.
        </p>

        <div className="mt-8 space-y-4 text-left">
          <h2 className="text-lg font-semibold text-foreground">
            What&apos;s next?
          </h2>
          <ul className="space-y-3">
            {nextSteps.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                <span className="shrink-0 text-base" aria-hidden="true">
                  {index < 2 ? "✅" : index === 2 ? "📅" : "📧"}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            asChild
            className="h-10 rounded-full bg-neutral-950 px-6 text-white hover:bg-neutral-800"
          >
            <Link href="/">Return to AIListify</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Contact:{" "}
            <a
              href="mailto:hello@ailistify.com"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              hello@ailistify.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
