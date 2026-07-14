import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthDialogProvider } from "@/components/auth/auth-dialog-provider";

type MainLayoutProps = {
  children: React.ReactNode;
  googleAuthEnabled?: boolean;
};

export function MainLayout({
  children,
  googleAuthEnabled = false,
}: MainLayoutProps) {
  return (
    <AuthDialogProvider googleAuthEnabled={googleAuthEnabled}>
      <div className="flex min-h-screen flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthDialogProvider>
  );
}
