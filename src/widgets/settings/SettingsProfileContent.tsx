"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { useSession } from "@/shared/api/auth-client";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  clearProfileAvatar,
  updateProfileNickname,
} from "@/server/profile/actions";

/**
 * Контент страницы настроек профиля: никнейм и аватар (как в макете).
 */
export function SettingsProfileContent() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [nicknamePending, startNicknameTransition] = useTransition();
  const [avatarPending, setAvatarPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = session?.user;
  const displayName = user?.name ?? user?.email ?? "";
  const imageUrl = user?.image ?? null;

  async function onSubmitNickname(formData: FormData) {
    startNicknameTransition(async () => {
      const result = await updateProfileNickname(null, formData);
      if (result.ok) {
        toast.success("Никнейм обновлён");
        await refetch?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarPending(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body,
        credentials: "include",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        toast.error(
          data.error === "FILE_TOO_LARGE"
            ? "Файл слишком большой (макс. 2 МБ)"
            : data.error === "INVALID_TYPE"
              ? "Допустимы JPEG, PNG, WebP, GIF"
              : "Не удалось загрузить аватар"
        );
        return;
      }
      toast.success("Аватар обновлён");
      await refetch?.();
      router.refresh();
    } finally {
      setAvatarPending(false);
    }
  }

  async function onRemoveAvatar() {
    setAvatarPending(true);
    try {
      const result = await clearProfileAvatar();
      if (result.ok) {
        toast.success("Аватар удалён");
        await refetch?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setAvatarPending(false);
    }
  }

  if (isPending || !session) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center text-muted-foreground">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Настройки профиля
        </h1>
        <p className="text-sm text-muted-foreground">
          В этом разделе настроек вы можете изменить данные вашего профиля.
        </p>
        <p className="text-sm text-muted-foreground">
          В основном, эти настройки влияют на то, как ваш профиль будет
          отображаться у других пользователей.
        </p>
      </header>

      {/* Карточка Никнейм */}
      <section className="rounded-xl border border-border bg-muted/50 p-6 shadow-sm dark:bg-muted/30">
        <h2 className="text-lg font-medium text-foreground">Никнейм</h2>
        <p className="mt-1 text-sm text-muted-foreground">Изменить ваш никнейм</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Этот никнейм будет отображаться в вашем профиле и будет виден другим
          пользователям.
        </p>
        <form
          action={onSubmitNickname}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Input
            name="nickname"
            defaultValue={displayName}
            placeholder="Никнейм"
            className="rounded-lg sm:max-w-xs"
            disabled={nicknamePending}
            aria-label="Никнейм"
          />
          <Button
            type="submit"
            variant="secondary"
            className="rounded-lg"
            disabled={nicknamePending}
          >
            {nicknamePending ? "Сохранение…" : "Обновить"}
          </Button>
        </form>
      </section>

      {/* Карточка Аватар */}
      <section className="rounded-xl border border-border bg-muted/50 p-6 shadow-sm dark:bg-muted/30">
        <h2 className="text-lg font-medium text-foreground">Аватар</h2>
        <p className="mt-1 text-sm text-muted-foreground">Обновить ваш аватар</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Этот аватар будет отображаться в вашем профиле и будет виден другим
          пользователям.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Аватар"
                fill
                className="object-cover"
                /* Payload Media / локальные URL без remotePatterns */
                unoptimized
              />
            ) : (
              <div className="flex size-full items-center justify-center text-2xl font-medium text-muted-foreground">
                {(displayName || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onPickFile}
            />
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg"
              disabled={avatarPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPending ? "Загрузка…" : "Выбрать изображение"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg"
              disabled={avatarPending || !imageUrl}
              onClick={onRemoveAvatar}
            >
              Удалить
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
