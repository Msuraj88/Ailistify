export function isActiveFeaturedListing(input: {
  featured: boolean;
  featuredUntil: Date | null;
  now?: Date;
}): boolean {
  if (!input.featured) {
    return false;
  }

  if (!input.featuredUntil) {
    return true;
  }

  const now = input.now ?? new Date();
  return input.featuredUntil > now;
}

export function isActiveSponsoredListing(input: {
  sponsored: boolean;
  sponsoredUntil: Date | null;
  now?: Date;
}): boolean {
  if (!input.sponsored) {
    return false;
  }

  if (!input.sponsoredUntil) {
    return true;
  }

  const now = input.now ?? new Date();
  return input.sponsoredUntil > now;
}

export function parseOptionalDateTime(value: string | undefined): Date | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDatetimeLocalValue(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }

  const value = new Date(date);
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function resolveFeaturedListingInput(input: {
  featured: boolean;
  featuredUntil?: string;
}) {
  if (!input.featured) {
    return { featured: false, featuredUntil: null };
  }

  return {
    featured: true,
    featuredUntil: parseOptionalDateTime(input.featuredUntil),
  };
}

export function resolveSponsoredListingInput(input: {
  sponsored: boolean;
  sponsoredUntil?: string;
}) {
  if (!input.sponsored) {
    return { sponsored: false, sponsoredUntil: null };
  }

  return {
    sponsored: true,
    sponsoredUntil: parseOptionalDateTime(input.sponsoredUntil),
  };
}
