import { HeroSection } from "@/components/shared/hero-section";
import { HomeSections } from "@/components/shared/home-sections";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo/json-ld";
import { createSeoMetadata } from "@/lib/metadata";
import { getHomePageData } from "@/services/directory/home";

export const metadata = createSeoMetadata({
  title: "AIListify — Discover the Best AI Tools",
  description:
    "Curated directory of the best AI tools for productivity, development, design, marketing, and more.",
  path: "/",
});

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <>
      <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />
      <HeroSection
        totalTools={data.totalTools}
        popularCategories={data.popularCategories}
      />
      <HomeSections data={data} />
    </>
  );
}
