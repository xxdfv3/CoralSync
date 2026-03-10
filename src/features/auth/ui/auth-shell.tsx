"use client";

/**
 * Оболочка входа/регистрации на базе Radix Dialog:
 * — фокус-ловушка, Escape, клик по оверлею
 * — blur-оверлей, без инлайн-цветов (токены темы)
 * — закрытие: back или replace(callbackURL)
 */
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/ui/dialog";

type AuthShellProps = {
  children: React.ReactNode;
  /** Текст для скрытого DialogTitle (a11y) */
  ariaLabel?: string;
  className?: string;
};

export function AuthShell({
  children,
  ariaLabel = "Авторизация",
  className,
}: AuthShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams?.get("callbackURL") ?? "/";

  const close = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace(callbackURL);
    }
  }, [router, callbackURL]);

  return (
    <Dialog
      open
      modal
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName={cn(
          "bg-background/85 backdrop-blur-md dark:bg-black/75",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )}
        className={cn(
          "max-w-[440px] gap-0 border-0 bg-transparent p-0 shadow-none",
          "duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "motion-reduce:animate-none motion-reduce:duration-0",
          className
        )}
        aria-describedby={undefined}
      >
        {/* Обязательный DialogTitle для Radix a11y; видимый заголовок внутри children */}
        <DialogTitle className="sr-only">{ariaLabel}</DialogTitle>

        <div className="relative w-full">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-1 top-1 z-10 rounded-md",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="Закрыть"
            onClick={close}
          >
            <XIcon className="size-4" aria-hidden />
          </Button>

          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
