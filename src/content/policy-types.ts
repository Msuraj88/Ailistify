export type PolicySection = {
  id: string;
  title: string;
  content?: string[];
  list?: string[];
  subsections?: {
    title: string;
    content?: string[];
    list?: string[];
    subsections?: {
      title: string;
      content?: string[];
      list?: string[];
    }[];
  }[];
};

export type PolicyMeta = {
  title: string;
  lastUpdated: string;
  contactEmail: string;
};
