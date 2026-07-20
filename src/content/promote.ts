import type { LucideIcon } from "lucide-react";
import { Bot, Eye, Sparkles, Star, TrendingUp, Users } from "lucide-react";

export type PromoteSectionId = "opportunities" | "faqs";

export type PromoteStat = {
  icon: LucideIcon;
  value: string;
  label: string;
};

export type PromotePackage = {
  id: string;
  plan: "HOMEPAGE_SPONSOR" | "FEATURED_LISTING";
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  price: string;
  compareAtPrice?: string;
  previewLabel: string;
  previewDescription: string;
  previewImage: string;
  previewAlt: string;
  ctaLabel: string;
};

export type PromoteFaq = {
  question: string;
  answer: string;
};

export type PromoteTestimonial = {
  quote: string;
  author: string;
  role: string;
};

export type PreviousSponsor = {
  name: string;
  website: string;
  logo: string;
};

export const promoteMeta = {
  title: "Promote Your AI Tool",
  contactEmail: "hi@ailistify.com",
};

export const promoteSections: {
  id: PromoteSectionId;
  label: string;
}[] = [
  { id: "opportunities", label: "Website Sponsorship Opportunities" },
  { id: "faqs", label: "FAQs" },
];

export const promotePackages: PromotePackage[] = [
  {
    id: "homepage-sponsor-chip",
    icon: Sparkles,
    title: "Homepage Sponsor — 4 Weeks",
    description:
      "Feature your tool in the homepage sponsor chip and stay visible to visitors across the site.",
    features: [
      "Your tool appears with logo + name in the hero sponsor chip, linking directly to your website.",
      "Drive consistent clicks and brand exposure from AI-focused visitors.",
      "Exclusive placement — only one homepage sponsor at a time.",
      "Featured in our AIListify newsletter email blast.",
      "SEO indexing boost for better discoverability.",
      "Social media promotion across our official channels.",
    ],
    price: "$99",
    compareAtPrice: "$145",
    previewLabel: "Homepage chip",
    previewDescription:
      "Appears at the top of the AIListify homepage above the main headline.",
    previewImage: "/sponsor.png",
    previewAlt: "Preview of the homepage sponsor chip placement",
    ctaLabel: "Reserve Your Spot",
    plan: "HOMEPAGE_SPONSOR",
  },
  {
    id: "featured-listing",
    icon: Star,
    title: "Featured Listing — 4 Weeks",
    description:
      "Highlight your tool across the directory with a featured badge and priority placement in listings.",
    features: [
      "Featured badge on your tool card across browse and category pages.",
      "Priority placement in featured sections on the homepage.",
      "Soft gradient border styling to stand out in listings.",
      "Great for launches, updates, and sustained visibility.",
    ],
    price: "$49",
    compareAtPrice: "$99",
    previewLabel: "Featured card",
    previewDescription:
      "Featured tools appear in the homepage featured grid and sort higher in listings.",
    previewImage: "/featured.png",
    previewAlt: "Preview of a featured tool card placement",
    ctaLabel: "Get Featured",
    plan: "FEATURED_LISTING",
  },
];

export function getPromotePackageByPlan(
  plan: PromotePackage["plan"],
): PromotePackage | undefined {
  return promotePackages.find((pkg) => pkg.plan === plan);
}

export const promoteFaqs: PromoteFaq[] = [
  {
    question: "How quickly can my sponsorship go live?",
    answer:
      "Most placements are reviewed and published within 2–3 business days after payment and asset confirmation.",
  },
  {
    question: "Can I combine multiple placements?",
    answer:
      "Yes. Many teams pair the homepage sponsor chip with featured or sponsored listings for maximum visibility.",
  },
  {
    question: "What do you need from me to get started?",
    answer:
      "We need your tool name, website URL, logo, a short description, and the placement package you want to purchase.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Refunds are available if your listing is rejected during review or we cannot deliver the purchased placement. See our Refund Policy for details.",
  },
  {
    question: "Who should I contact for custom campaigns?",
    answer:
      "Email hi@ailistify.com with your goals and timeline. We can discuss bundles, longer terms, and custom placements.",
  },
];

export const promoteTestimonials: PromoteTestimonial[] = [
  {
    quote:
      "The homepage sponsor chip drove a steady stream of qualified visitors within the first week.",
    author: "Product Marketing Lead",
    role: "AI SaaS startup",
  },
  {
    quote:
      "Featured placement helped us stand out in a crowded category and improved trial signups.",
    author: "Founder",
    role: "Developer tools company",
  },
  {
    quote:
      "Clear pricing, fast setup, and placements that actually match how buyers discover tools.",
    author: "Growth Manager",
    role: "B2B AI platform",
  },
];

export const previousSponsors: PreviousSponsor[] = [
  {
    name: "Logo Diffusion",
    website: "https://logodiffusion.com",
    logo: "https://ik.imagekit.io/ailistify/tools/logos/logo-diffusion-1782933982784_M5wBUavHdS.png",
  },
  {
    name: "MagicSlides",
    website: "https://www.magicslides.app",
    logo: "https://ik.imagekit.io/ailistify/tools/logos/magicslides-1782933866466_adNOCC_AF.svg",
  },
  {
    name: "Kimi AI",
    website: "http://kimi.com",
    logo: "https://ik.imagekit.io/ailistify/tools/logos/kimi-ai-1782933171400_wQQ4mncEd.jpg",
  },
  {
    name: "Quillbot",
    website: "https://quillbot.com",
    logo: "https://ik.imagekit.io/ailistify/ailistify/tools/logos/favicon_-_2026-07-02T004711.742_jao6jCfaZ.png",
  },
  {
    name: "Genmo",
    website: "https://www.genmo.ai",
    logo: "https://ik.imagekit.io/ailistify/ailistify/tools/logos/favicon_-_2026-07-02T004104.694_-OZrA5i3N.png",
  },
  {
    name: "GPTHumanizer AI",
    website: "https://www.gpthumanizer.ai",
    logo: "https://ik.imagekit.io/ailistify/tools/logos/gpthumanizer-ai-1782932629394_vQunkRzJJ.png",
  },
  {
    name: "Thumbnail AI",
    website: "https://thumbnail-ai.app",
    logo: "https://ik.imagekit.io/ailistify/tools/logos/thumbnail-ai-1782917055770_bv0ToF46bH.png",
  },
  {
    name: "Interior AI",
    website: "https://interiorai.com",
    logo: "https://ik.imagekit.io/ailistify/tools/logos/interior-ai-1782916367892_sigNjx5T_U.svg",
  },
];

export function buildPromoteStats(): PromoteStat[] {
  return [
    { icon: Eye, value: "80,000+", label: "Monthly Pageviews" },
    { icon: Users, value: "14,000+", label: "Monthly Visitors" },
    {
      icon: Bot,
      value: "5,000+",
      label: "AI Tools Listed",
    },
    {
      icon: TrendingUp,
      value: "3x",
      label: "Traffic Growth in the Past 90 Days",
    },
  ];
}

export const promoteStatsFooter =
  "Trusted by AI startups and SaaS companies to drive visibility, qualified traffic, and product discovery.";
