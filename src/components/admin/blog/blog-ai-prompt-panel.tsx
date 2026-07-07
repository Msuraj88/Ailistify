"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateBlogWithAI } from "@/actions/admin/blog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_AI_EXAMPLES } from "@/lib/constants/blog";

type BlogAiPromptPanelProps = {
  onDone?: () => void;
};

export function BlogAiPromptPanel({ onDone }: BlogAiPromptPanelProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);

    try {
      const result = await generateBlogWithAI({ prompt });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Blog generated. Opening editor...");
      onDone?.();
      router.push(`/admin/content/blogs/${result.data.id}/edit`);
    } catch (error) {
      console.error("[blog-ai] client error", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Blog generation failed. Please try again.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Describe the blog you want to create..."
        rows={8}
        disabled={isGenerating}
        className="min-h-[180px]"
      />

      <div className="flex flex-wrap gap-2">
        {BLOG_AI_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            disabled={isGenerating}
            onClick={() => setPrompt(example)}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </div>

      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled={isGenerating || prompt.trim().length < 10}
        onClick={() => void handleGenerate()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating with AI...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Blog with AI
          </>
        )}
      </Button>
    </div>
  );
}
