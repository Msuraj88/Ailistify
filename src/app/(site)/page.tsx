import { HeroSection } from "@/components/shared/hero-section";
import { HomeSections } from "@/components/shared/home-sections";
import { createMetadata } from "@/lib/metadata";
import { getHomePageData } from "@/services/directory/home";

export const metadata = createMetadata({
  title: "AIListify — Discover the Best AI Tools",
  description:
    "Curated directory of the best AI tools for productivity, development, design, marketing, and more.",
});

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <>
      <HeroSection
        totalTools={data.totalTools}
        popularSearches={data.popularSearches}
      />
      <HomeSections data={data} />
    </>
  );
}
