"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LoginToBookmarkDialog } from "@/components/bookmarks/login-to-bookmark-dialog";

type LoginPrompt = {
  toolName: string;
};

type BookmarkContextValue = {
  isBookmarked: (toolId: string) => boolean;
  setBookmarked: (toolId: string, bookmarked: boolean) => void;
  promptLogin: (toolName: string) => void;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function useBookmarks() {
  const context = useContext(BookmarkContext);

  if (!context) {
    throw new Error("useBookmarks must be used within BookmarkProvider");
  }

  return context;
}

type BookmarkProviderProps = {
  children: React.ReactNode;
  initialIds: string[];
};

export function BookmarkProvider({
  children,
  initialIds,
}: BookmarkProviderProps) {
  const pathname = usePathname();
  const [bookmarkIds, setBookmarkIds] = useState(() => new Set(initialIds));
  const [loginPrompt, setLoginPrompt] = useState<LoginPrompt | null>(null);

  useEffect(() => {
    setBookmarkIds(new Set(initialIds));
  }, [initialIds]);

  const isBookmarked = useCallback(
    (toolId: string) => bookmarkIds.has(toolId),
    [bookmarkIds],
  );

  const setBookmarked = useCallback((toolId: string, bookmarked: boolean) => {
    setBookmarkIds((current) => {
      const next = new Set(current);

      if (bookmarked) {
        next.add(toolId);
      } else {
        next.delete(toolId);
      }

      return next;
    });
  }, []);

  const promptLogin = useCallback((toolName: string) => {
    setLoginPrompt({ toolName });
  }, []);

  const value = useMemo(
    () => ({ isBookmarked, setBookmarked, promptLogin }),
    [isBookmarked, setBookmarked, promptLogin],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
      {loginPrompt ? (
        <LoginToBookmarkDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setLoginPrompt(null);
            }
          }}
          callbackUrl={pathname}
          toolName={loginPrompt.toolName}
        />
      ) : null}
    </BookmarkContext.Provider>
  );
}
