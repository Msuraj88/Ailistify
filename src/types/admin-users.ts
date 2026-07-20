import type {
  ListingPlan,
  PaymentStatus,
  PricingModel,
  ToolStatus,
  UserRole,
} from "@/generated/prisma/client";

export type AdminUserListItem = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  submittedToolCount: number;
  isFounder: boolean;
};

export type AdminFounderSubmittedTool = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  websiteUrl: string;
  shortDescription: string;
  pricingModel: PricingModel;
  status: ToolStatus;
  listingPlan: ListingPlan;
  paymentStatus: PaymentStatus;
  submissionId: string | null;
  submitterEmail: string | null;
  rejectionReason: string | null;
  featured: boolean;
  verified: boolean;
  views: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string };
  stageLabel: string;
  stageDetail: string;
};

export type AdminFounderProfile = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  isFounder: boolean;
  submittedToolCount: number;
  tools: AdminFounderSubmittedTool[];
};
