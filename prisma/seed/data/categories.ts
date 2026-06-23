import { slugify } from "../helpers";

export type CategorySeed = {
  name: string;
  slug: string;
  description: string;
};

export const categories: CategorySeed[] = [
  {
    name: "Writing",
    slug: slugify("Writing"),
    description:
      "AI tools for copywriting, blogging, editing, and long-form content creation.",
  },
  {
    name: "Image Generation",
    slug: slugify("Image Generation"),
    description:
      "Create, edit, and enhance images using generative AI models and creative workflows.",
  },
  {
    name: "Video Generation",
    slug: slugify("Video Generation"),
    description:
      "Generate, edit, and repurpose video content with AI-powered production tools.",
  },
  {
    name: "Coding",
    slug: slugify("Coding"),
    description:
      "AI coding assistants, debuggers, and developer productivity platforms.",
  },
  {
    name: "Productivity",
    slug: slugify("Productivity"),
    description:
      "Boost personal and team productivity with intelligent automation and assistants.",
  },
  {
    name: "Marketing",
    slug: slugify("Marketing"),
    description:
      "AI platforms for campaigns, ads, social media, and brand growth.",
  },
  {
    name: "SEO",
    slug: slugify("SEO"),
    description:
      "Optimize search rankings with AI-driven keyword, content, and technical SEO tools.",
  },
  {
    name: "Design",
    slug: slugify("Design"),
    description:
      "UI/UX, graphic design, and creative tooling powered by artificial intelligence.",
  },
  {
    name: "Automation",
    slug: slugify("Automation"),
    description:
      "Automate workflows, integrations, and repetitive business processes with AI.",
  },
  {
    name: "Research",
    slug: slugify("Research"),
    description:
      "Accelerate literature review, market research, and data discovery with AI.",
  },
  {
    name: "Education",
    slug: slugify("Education"),
    description:
      "Learning platforms, tutoring, and educational content tools enhanced by AI.",
  },
  {
    name: "Customer Support",
    slug: slugify("Customer Support"),
    description:
      "AI chatbots, helpdesk automation, and customer experience platforms.",
  },
  {
    name: "Sales",
    slug: slugify("Sales"),
    description:
      "Prospecting, outreach, CRM enrichment, and sales intelligence powered by AI.",
  },
  {
    name: "Analytics",
    slug: slugify("Analytics"),
    description:
      "Business intelligence, forecasting, and data analytics tools with AI insights.",
  },
  {
    name: "Voice AI",
    slug: slugify("Voice AI"),
    description:
      "Text-to-speech, speech-to-text, voice cloning, and conversational voice agents.",
  },
];
