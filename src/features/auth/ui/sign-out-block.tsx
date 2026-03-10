"use client";

import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/shared/api/auth-client";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

/**
 * Блок для авторизованного пользователя: приветствие и кнопка «Выйти».
 * Показывается на главной и других страницах при наличии сессии.
 */
export function SignOutBlock() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending || !session) return null;

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Вы вышли из аккаунта");
          router.push("/");
        },
      },
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <span className="text-sm text-muted-foreground">
        Вы вошли как <span className="font-medium text-foreground">{session.user.name ?? session.user.email}</span>
      </span>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Выйти
      </Button>
    </div>
  );
}
