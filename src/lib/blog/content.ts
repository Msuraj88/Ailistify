import type { BlogFaqItem, GeneratedBlogContent } from "@/types/blog";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function containsBlockHtml(text: string): boolean {
  return /<(?:p|h[1-6]|ul|ol|li|table|blockquote|div|pre)\b/i.test(text);
}

function plainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const headingMatch = block.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
        return `<${tag}>${headingMatch[2]}</${tag}>`;
      }

      if (/^[-*•]\s/m.test(block)) {
        const items = block
          .split(/\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => `<li>${line.replace(/^[-*•]\s*/, "")}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

export function normalizeBlogHtml(html: string): string {
  let output = html.trim();

  output = output.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "");

  if (!containsBlockHtml(output)) {
    output = plainTextToHtml(output);
  }

  output = output.replace(/<h1(\s|>)/gi, "<h2$1").replace(/<\/h1>/gi, "</h2>");

  return applyBlogToolLinkTargets(output);
}

export function applyBlogToolLinkTargets(html: string): string {
  return html.replace(
    /<a\b([^>]*?\bhref\s*=\s*["']\/tools\/[^"']+["'][^>]*)>/gi,
    (_match, attrs: string) => {
      let next = attrs;

      if (/\btarget\s*=/.test(next)) {
        next = next.replace(
          /\btarget\s*=\s*["'][^"']*["']/i,
          'target="_blank"',
        );
      } else {
        next += ' target="_blank"';
      }

      if (/\brel\s*=/.test(next)) {
        if (!/noopener/i.test(next)) {
          next = next.replace(
            /\brel\s*=\s*(["'])([^"']*)\1/i,
            (_relMatch, quote: string, rel: string) =>
              `rel=${quote}${rel} noopener noreferrer${quote}`,
          );
        }
      } else {
        next += ' rel="noopener noreferrer"';
      }

      return `<a${next}>`;
    },
  );
}

function toHtmlBlock(value: string, fallbackTag: "p" | "div" = "p"): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (containsBlockHtml(trimmed)) {
    return normalizeBlogHtml(trimmed);
  }

  return `<${fallbackTag}>${escapeHtml(trimmed)}</${fallbackTag}>`;
}

function buildFaqSection(faq: BlogFaqItem[]): string {
  if (faq.length === 0) {
    return "";
  }

  const items = faq
    .map((item) => {
      const question = item.question.trim();
      const answer = item.answer.trim();
      if (!question || !answer) {
        return "";
      }

      return `<h3>${escapeHtml(question)}</h3>\n${toHtmlBlock(answer)}`;
    })
    .filter(Boolean)
    .join("\n");

  return `<h2>Frequently Asked Questions</h2>\n<div class="blog-faq">\n${items}\n</div>`;
}

export function assembleGeneratedBlogContent(
  generated: Pick<
    GeneratedBlogContent,
    "title" | "excerpt" | "content" | "faq" | "conclusion" | "cta"
  >,
): string {
  const parts: string[] = [];

  const body = normalizeBlogHtml(generated.content);
  parts.push(body);

  const faqSection = buildFaqSection(generated.faq);
  if (faqSection) {
    parts.push(faqSection);
  }

  const conclusion = generated.conclusion.trim();
  if (conclusion) {
    const conclusionHtml = normalizeBlogHtml(conclusion);
    if (/<h2/i.test(conclusionHtml)) {
      parts.push(conclusionHtml);
    } else {
      parts.push(`<h2>Conclusion</h2>\n${toHtmlBlock(conclusionHtml)}`);
    }
  }

  const cta = generated.cta.trim();
  if (cta) {
    parts.push(`<div class="blog-cta">\n${toHtmlBlock(cta, "div")}\n</div>`);
  }

  return parts.join("\n\n");
}
