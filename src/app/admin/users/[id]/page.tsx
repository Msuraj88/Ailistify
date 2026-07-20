import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FounderProfileView } from "@/components/admin/users/founder-profile-view";
import { createMetadata } from "@/lib/metadata";
import { getAdminFounderProfile } from "@/services/admin/users";

type AdminUserProfilePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AdminUserProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getAdminFounderProfile(id);

  if (!profile) {
    return createMetadata({
      title: "User not found",
      description: "The requested user profile could not be found.",
    });
  }

  const name = profile.name?.trim() || profile.email;

  return createMetadata({
    title: profile.isFounder ? `Founder · ${name}` : `User · ${name}`,
    description: `Admin profile for ${name}.`,
  });
}

export default async function AdminUserProfilePage({
  params,
}: AdminUserProfilePageProps) {
  const { id } = await params;
  const profile = await getAdminFounderProfile(id);

  if (!profile) {
    notFound();
  }

  return <FounderProfileView profile={profile} />;
}
