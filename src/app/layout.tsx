import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/shared/app-toaster";
import { AuthSessionProvider } from "@/components/shared/session-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { auth } from "@/lib/auth";
import { extensionHydrationFixScript } from "@/lib/extension-hydration-fix";
import { createMetadata } from "@/lib/metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = createMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full"
        suppressHydrationWarning
        data-bwignore="true"
        data-1p-ignore
        data-lpignore="true"
      >
        <Script
          id="extension-hydration-fix"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: extensionHydrationFixScript }}
        />
        <AuthSessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            disableTransitionOnChange
          >
            {children}
            <AppToaster />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
