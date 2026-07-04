import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type MainLayoutProps = {
  children: React.ReactNode;
  googleAuthEnabled?: boolean;
};

export function MainLayout({
  children,
  googleAuthEnabled = false,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
      <Header googleAuthEnabled={googleAuthEnabled} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
