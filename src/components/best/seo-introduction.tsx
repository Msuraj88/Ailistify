type SeoIntroductionProps = {
  content: string;
};

export function SeoIntroduction({ content }: SeoIntroductionProps) {
  const paragraphs = content
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section id="introduction" className="scroll-mt-24 space-y-4">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Introduction
      </h2>
      <div className="max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
