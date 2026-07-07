"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BlogToolLink = Link.extend({
  renderHTML({ HTMLAttributes }) {
    const href = HTMLAttributes.href;
    const isToolLink = typeof href === "string" && href.includes("/tools/");

    if (!isToolLink) {
      return ["a", HTMLAttributes, 0];
    }

    return [
      "a",
      {
        ...HTMLAttributes,
        target: "_blank",
        rel: "noopener noreferrer",
      },
      0,
    ];
  },
});

type BlogEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

export function BlogEditor({ value, onChange, disabled }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      BlogToolLink.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Write your blog content..." }),
      Youtube.configure({ width: 640, height: 360 }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previous ?? "https://");
    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const linkAttrs = url.includes("/tools/")
      ? { href: url, target: "_blank", rel: "noopener noreferrer" }
      : { href: url };
    editor.chain().focus().extendMarkRange("link").setLink(linkAttrs).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt("Enter YouTube URL");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
        <ToolbarButton
          label="Bold"
          disabled={disabled}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          disabled={disabled}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          disabled={disabled}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strike"
          disabled={disabled}
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 1"
          disabled={disabled}
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          disabled={disabled}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          disabled={disabled}
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          disabled={disabled}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered list"
          disabled={disabled}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          disabled={disabled}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          disabled={disabled}
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Link" disabled={disabled} onClick={addLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Image" disabled={disabled} onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="YouTube" disabled={disabled} onClick={addYoutube}>
          <Video className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Insert table"
          disabled={disabled}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align left"
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Undo"
          disabled={disabled}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={disabled}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        className={cn(
          "blog-editor prose prose-neutral dark:prose-invert max-w-none min-h-[420px] p-4 focus:outline-none",
          "[&_.ProseMirror]:min-h-[420px] [&_.ProseMirror]:outline-none",
          "[&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:mt-8 [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:leading-tight",
          "[&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-8 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:leading-snug",
          "[&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-6 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:leading-snug",
          "[&_.ProseMirror_p]:mb-4 [&_.ProseMirror_p]:leading-7",
          "[&_.ProseMirror_ul]:mb-4 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6",
          "[&_.ProseMirror_ol]:mb-4 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6",
          "[&_.ProseMirror_li]:mb-1",
          "[&_.ProseMirror_blockquote]:mb-4 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic",
          "[&_.ProseMirror_table]:mb-4 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse",
          "[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border [&_.ProseMirror_th]:bg-muted/50 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:text-left",
          "[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border [&_.ProseMirror_td]:p-2",
          "[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline",
          disabled && "opacity-60",
        )}
      />
    </div>
  );
}
