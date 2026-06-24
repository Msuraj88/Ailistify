import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/metadata";

export const runtime = "edge";
export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "#a5b4fc",
          marginBottom: 24,
        }}
      >
        {siteConfig.name}
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.04em",
          maxWidth: 900,
        }}
      >
        Discover the Best AI Tools
      </div>
      <div
        style={{
          marginTop: 28,
          fontSize: 28,
          lineHeight: 1.4,
          color: "#cbd5e1",
          maxWidth: 820,
        }}
      >
        Curated directory for productivity, development, design, and more.
      </div>
    </div>,
    size,
  );
}
