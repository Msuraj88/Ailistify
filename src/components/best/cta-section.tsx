import { NewsletterForm } from "@/components/directory/newsletter-form";

type CTASectionProps = {
  title?: string;
  description?: string;
};

export function CTASection({
  title = "Get the best AI tools in your inbox",
  description = "Join the AIListify newsletter for curated AI tool picks, new Best guides, and product updates.",
}: CTASectionProps) {
  return (
    <section
      id="newsletter"
      className="scroll-mt-24 rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-muted/40 px-6 py-10 text-center sm:px-10"
    >
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
        {description}
      </p>
      <div className="mx-auto mt-6 max-w-md">
        <NewsletterForm />
      </div>
    </section>
  );
}
