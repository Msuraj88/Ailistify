export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "AI Tools" },
  { href: "/bookmarks", label: "Saved" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: "/tools", label: "All Tools" },
    { href: "/categories", label: "Categories" },
    { href: "/submit-tool", label: "Submit a Tool" },
    { href: "/featured", label: "Featured" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
  resources: [
    { href: "/docs", label: "Documentation" },
    { href: "/api", label: "API" },
    { href: "/changelog", label: "Changelog" },
    { href: "/support", label: "Support" },
  ],
} as const;

export const TOOL_CATEGORIES = [
  {
    slug: "productivity",
    name: "Productivity",
    description: "Boost your workflow with AI-powered productivity tools",
    icon: "Zap",
  },
  {
    slug: "development",
    name: "Development",
    description: "Code faster with AI coding assistants and dev tools",
    icon: "Code2",
  },
  {
    slug: "design",
    name: "Design",
    description: "Create stunning visuals with AI design tools",
    icon: "Palette",
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "Grow your business with AI marketing solutions",
    icon: "TrendingUp",
  },
  {
    slug: "writing",
    name: "Writing",
    description: "Craft compelling content with AI writing assistants",
    icon: "PenLine",
  },
  {
    slug: "image-generation",
    name: "Image Generation",
    description: "Generate images from text with cutting-edge AI models",
    icon: "Image",
  },
] as const;

export const FEATURED_TOOLS_PLACEHOLDER = [
  {
    id: "1",
    name: "ChatGPT",
    slug: "chatgpt",
    description:
      "Advanced conversational AI for writing, coding, analysis, and creative tasks.",
    category: "Productivity",
    tags: ["chatbot", "writing", "coding"],
    featured: true,
  },
  {
    id: "2",
    name: "Midjourney",
    slug: "midjourney",
    description:
      "Create stunning AI-generated artwork and images from text prompts.",
    category: "Image Generation",
    tags: ["art", "images", "creative"],
    featured: true,
  },
  {
    id: "3",
    name: "GitHub Copilot",
    slug: "github-copilot",
    description:
      "AI pair programmer that helps you write code faster and with fewer errors.",
    category: "Development",
    tags: ["coding", "IDE", "autocomplete"],
    featured: true,
  },
  {
    id: "4",
    name: "Notion AI",
    slug: "notion-ai",
    description:
      "Integrated AI assistant for writing, brainstorming, and organizing within Notion.",
    category: "Productivity",
    tags: ["notes", "writing", "organization"],
    featured: true,
  },
  {
    id: "5",
    name: "Claude",
    slug: "claude",
    description:
      "Helpful, harmless, and honest AI assistant for complex reasoning tasks.",
    category: "Productivity",
    tags: ["chatbot", "analysis", "writing"],
    featured: true,
  },
  {
    id: "6",
    name: "Runway",
    slug: "runway",
    description:
      "Creative suite for AI video generation, editing, and visual effects.",
    category: "Design",
    tags: ["video", "editing", "creative"],
    featured: true,
  },
] as const;
