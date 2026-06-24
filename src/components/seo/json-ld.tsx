import { serializeJsonLd } from "@/lib/seo/json-ld";

type JsonLdProps = {
  data: Record<string, unknown> | unknown[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
