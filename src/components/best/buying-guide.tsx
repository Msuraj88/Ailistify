import type { BestBuyingGuide } from "@/types/best";

type BuyingGuideProps = {
  guide: BestBuyingGuide;
};

export function BuyingGuide({ guide }: BuyingGuideProps) {
  return (
    <section id="buying-guide" className="scroll-mt-24 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Buying guide
        </h2>
        <p className="mt-2 text-muted-foreground">
          How to choose the right AI tools without wasting budget.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold">How to choose</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {guide.howToChoose}
          </p>
        </article>

        <article className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold">Who should use them</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {guide.whoShouldUse}
          </p>
        </article>

        <article className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold">Features that matter</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {guide.featuresThatMatter.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold">Pricing advice</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {guide.pricingAdvice}
          </p>
        </article>
      </div>
    </section>
  );
}
