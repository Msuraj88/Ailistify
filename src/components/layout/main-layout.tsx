import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
