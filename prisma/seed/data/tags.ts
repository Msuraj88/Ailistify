import { slugify } from "../helpers";

export type TagSeed = {
  name: string;
  slug: string;
  description: string;
};

const tag = (name: string, description: string): TagSeed => ({
  name,
  slug: slugify(name),
  description,
});

export const tags: TagSeed[] = [
  tag("Chatbot", "Conversational AI interfaces for websites and apps."),
  tag("AI Assistant", "General-purpose AI helpers for daily tasks."),
  tag("Content Creation", "Tools for generating articles, posts, and media."),
  tag("Automation", "Workflow and process automation powered by AI."),
  tag("Productivity", "Personal and team efficiency boosters."),
  tag("SEO", "Search engine optimization and ranking tools."),
  tag("Marketing", "Campaign, ads, and growth marketing platforms."),
  tag("Design", "Visual and UX design assistance."),
  tag("Video", "Video creation, editing, and repurposing."),
  tag("Audio", "Audio editing, generation, and enhancement."),
  tag("Coding", "Developer assistants and code generation."),
  tag("Research", "Academic, market, and web research tools."),
  tag("CRM", "Customer relationship management with AI."),
  tag("Sales", "Outbound, pipeline, and revenue intelligence."),
  tag("Education", "Learning, tutoring, and course creation."),
  tag("Image Generation", "Text-to-image and generative art tools."),
  tag("Text to Speech", "Natural-sounding voice synthesis."),
  tag("Speech to Text", "Transcription and voice recognition."),
  tag("No Code", "Build apps and workflows without coding."),
  tag("Email Marketing", "AI-powered email campaigns and sequences."),
  tag("Social Media", "Scheduling, writing, and analytics for social."),
  tag("Copywriting", "Sales copy, ads, and landing page writing."),
  tag("Translation", "Multilingual translation and localization."),
  tag("Summarization", "Condense documents, videos, and meetings."),
  tag("Data Analysis", "Insights, charts, and predictive analytics."),
  tag("Customer Service", "Support tickets and helpdesk automation."),
  tag("E-commerce", "Product listings, recommendations, and storefront AI."),
  tag("HR", "Recruiting, onboarding, and people operations."),
  tag("Recruiting", "Sourcing, screening, and interview tools."),
  tag("Legal", "Contract review and legal research assistants."),
  tag("Finance", "Forecasting, bookkeeping, and financial analysis."),
  tag("Healthcare", "Clinical documentation and medical AI tools."),
  tag("Real Estate", "Listings, valuations, and property marketing."),
  tag("Gaming", "NPCs, assets, and game development AI."),
  tag("3D", "3D modeling, texturing, and scene generation."),
  tag("Presentation", "Slides, decks, and pitch creation."),
  tag("Meeting Notes", "Capture and summarize meetings automatically."),
  tag("Transcription", "Convert speech and media to text."),
  tag("Voice Cloning", "Replicate and customize synthetic voices."),
  tag("Avatar", "Digital humans and talking head videos."),
  tag("API", "Developer APIs for AI capabilities."),
  tag("Open Source", "Self-hosted and community-driven AI projects."),
  tag("Enterprise", "Large-scale deployments with admin controls."),
  tag("Startups", "Tools tailored for early-stage companies."),
  tag("Browser Extension", "AI features inside Chrome and other browsers."),
  tag("Mobile App", "AI tools designed for iOS and Android."),
  tag("Workflow", "Multi-step pipelines and orchestration."),
  tag("Integration", "Connect AI to Slack, Notion, and other apps."),
  tag("Analytics", "Usage metrics, attribution, and reporting."),
  tag("Knowledge Base", "Internal wikis and document Q&A systems."),
];
