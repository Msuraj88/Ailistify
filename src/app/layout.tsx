import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/shared/app-toaster";
import { AuthSessionProvider } from "@/components/shared/session-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { auth } from "@/lib/auth";
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
      <body className="min-h-full" suppressHydrationWarning>
        <AuthSessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
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
