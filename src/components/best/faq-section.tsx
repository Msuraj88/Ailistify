import type { BestFaqItem } from "@/types/best";

type FAQSectionProps = {
  items: BestFaqItem[];
};

export function FAQSection({ items }: FAQSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-muted-foreground">
          Common questions about choosing and using these AI tools.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border bg-card px-5 py-4"
          >
            <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.question}
                <span
                  aria-hidden="true"
                  className="mt-0.5 text-muted-foreground transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
