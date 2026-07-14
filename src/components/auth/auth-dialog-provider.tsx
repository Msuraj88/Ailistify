"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { LoginDialog } from "@/components/auth/login-dialog";

type AuthDialogContextValue = {
  openLogin: (callbackUrl?: string) => void;
  closeLogin: () => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

type AuthDialogProviderProps = {
  children: React.ReactNode;
  googleAuthEnabled?: boolean;
};

export function AuthDialogProvider({
  children,
  googleAuthEnabled = false,
}: AuthDialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");

  const openLogin = useCallback((nextCallbackUrl = "/") => {
    setCallbackUrl(nextCallbackUrl);
    setOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openLogin,
      closeLogin,
    }),
    [openLogin, closeLogin],
  );

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <LoginDialog
          open={open}
          onOpenChange={setOpen}
          callbackUrl={callbackUrl}
          googleAuthEnabled={googleAuthEnabled}
        />
      </Suspense>
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);

  if (!context) {
    throw new Error("useAuthDialog must be used within AuthDialogProvider");
  }

  return context;
}
