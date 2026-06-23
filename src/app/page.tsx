import { HeroSection } from "@/components/shared/hero-section";
import {
  CategoriesSection,
  CtaSection,
  FeaturedToolsSection,
} from "@/components/shared/home-sections";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "AIListify — Discover the Best AI Tools",
  description:
    "Curated directory of the best AI tools for productivity, development, design, marketing, and more.",
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedToolsSection />
      <CategoriesSection />
      <CtaSection />
    </>
  );
}
