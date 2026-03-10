import { Suspense } from "react";

import { SignInView } from "@/features/auth/ui/sign-in-view";

function SignInFallback() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
      role="status"
      aria-busy="true"
    >
      <span
        className="size-10 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground motion-safe:animate-spin motion-reduce:animate-none"
        aria-hidden
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInView />
    </Suspense>
  );
}
