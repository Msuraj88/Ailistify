import type { PolicySection } from "@/content/privacy-policy";

type PolicyBlockProps = {
  section: PolicySection;
  level?: 2 | 3 | 4;
};

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function PolicyBlock({ section, level = 2 }: PolicyBlockProps) {
  const Heading = level === 2 ? "h2" : level === 3 ? "h3" : "h4";
  const headingClass =
    level === 2
      ? "text-2xl font-semibold tracking-tight"
      : level === 3
        ? "text-lg font-semibold"
        : "text-base font-semibold";

  return (
    <section className="space-y-4">
      <Heading className={headingClass}>{section.title}</Heading>

      {section.content?.map((paragraph) => (
        <p key={paragraph} className="text-muted-foreground leading-7">
          {paragraph}
        </p>
      ))}

      {"list" in section && section.list ? (
        <PolicyList items={section.list} />
      ) : null}

      {section.subsections?.map((subsection) => (
        <PolicyBlock
          key={subsection.title}
          section={{
            id: subsection.title,
            title: subsection.title,
            content: subsection.content,
            list: subsection.list,
            subsections: subsection.subsections,
          }}
          level={Math.min(level + 1, 4) as 2 | 3 | 4}
        />
      ))}
    </section>
  );
}

type PrivacyPolicyContentProps = {
  sections: PolicySection[];
};

export function PrivacyPolicyContent({ sections }: PrivacyPolicyContentProps) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <PolicyBlock key={section.id} section={section} />
      ))}
    </div>
  );
}
