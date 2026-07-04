import { ADMIN_TOOL_PRICING_MODELS } from "@/lib/constants/tools";

export const SUBMIT_DRAFT_STORAGE_KEY = "ailistify-submit-draft";

export type SubmitDraftPricingModel =
  (typeof ADMIN_TOOL_PRICING_MODELS)[number];

export type SubmitDraftImage = {
  imageUrl: string;
  altText?: string;
  caption?: string;
  sortOrder: number;
};

export type SubmitDraft = {
  name: string;
  websiteUrl: string;
  submitterEmail: string;
  categoryId: string;
  pricingModel: SubmitDraftPricingModel;
  tagIds: string[];
  shortDescription: string;
  fullDescription: string;
  logo: string;
  images: SubmitDraftImage[];
  metaTitle: string;
  metaDescription: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  discordUrl: string;
  pricingUrl: string;
};

export const EMPTY_SUBMIT_DRAFT: SubmitDraft = {
  name: "",
  websiteUrl: "",
  submitterEmail: "",
  categoryId: "",
  pricingModel: "FREE" as SubmitDraftPricingModel,
  tagIds: [],
  shortDescription: "",
  fullDescription: "",
  logo: "",
  images: [],
  metaTitle: "",
  metaDescription: "",
  twitterUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  discordUrl: "",
  pricingUrl: "",
};

export function readSubmitDraft(): SubmitDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SUBMIT_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as SubmitDraft;
  } catch {
    return null;
  }
}

export function writeSubmitDraft(draft: SubmitDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SUBMIT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearSubmitDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SUBMIT_DRAFT_STORAGE_KEY);
}
