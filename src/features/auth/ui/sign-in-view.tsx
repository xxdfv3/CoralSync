"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AUTH_CARD_CLASS,
  AUTH_CARD_LINK_CLASS,
} from "@/features/auth/ui/auth-constants";
import { AuthShell } from "@/features/auth/ui/auth-shell";
import { FormRootError } from "@/features/auth/ui/form-root-error";
import { PasswordInput } from "@/features/auth/ui/password-input";
import { authClient, useSession } from "@/shared/api/auth-client";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

const signInSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const defaultValues: SignInFormValues = {
  email: "",
  password: "",
};

function buildAuthHref(path: string, callbackURL: string) {
  return callbackURL !== "/"
    ? `${path}?callbackURL=${encodeURIComponent(callbackURL)}`
    : path;
}

/**
 * Полный UI входа (модалка + форма). Используется и на /sign-in, и в intercepting slot.
 */
export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams?.get("callbackURL") ?? "/";
  const { data: session, isPending: isSessionPending } = useSession();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!isSessionPending && session) {
      router.replace(callbackURL);
    }
  }, [session, isSessionPending, router, callbackURL]);

  async function onSubmit(values: SignInFormValues) {
    form.clearErrors("root");
    const { error } = await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL,
      },
      {
        onRequest: () => {
          form.resetField("password", { keepDirty: false });
        },
        onSuccess: () => {
          toast.success("Вход выполнен");
          router.push(callbackURL);
        },
        onError: () => {
          toast.error("Неверный email или пароль");
        },
      }
    );

    if (error) {
      form.setError("root", {
        message: "Неверный email или пароль",
      });
    }
  }

  if (isSessionPending) {
    return (
      <AuthShell ariaLabel="Загрузка">
        <Card className={AUTH_CARD_CLASS}>
          <div className="flex min-h-[200px] items-center justify-center px-6 py-12">
            <Loader2Icon
              className="size-8 animate-spin text-muted-foreground motion-reduce:animate-none"
              aria-hidden
            />
            <span className="sr-only">Загрузка…</span>
          </div>
        </Card>
      </AuthShell>
    );
  }

  const signUpHref = buildAuthHref("/sign-up", callbackURL);

  return (
    <AuthShell ariaLabel="Вход в CoralSync">
      <Card className={AUTH_CARD_CLASS}>
        <CardHeader className="space-y-1 px-6 pb-0 pt-10 text-center sm:text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Вход
          </CardTitle>
          <CardDescription className="text-pretty">
            Введите email и пароль для входа в CoralSync
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col"
          >
            <CardContent className="space-y-4 px-6 pt-2">
              <FormRootError
                errors={form.formState.errors}
                className="motion-safe:animate-in motion-safe:fade-in-0 motion-reduce:animate-none"
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="sign-in-email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="sign-in-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="sign-in-password">Пароль</FormLabel>
                    <FormControl>
                      <PasswordInput
                        id="sign-in-password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-6 pb-6 pt-4">
              <Button
                type="submit"
                className="h-10 w-full font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon
                      className="size-4 animate-spin motion-reduce:animate-none"
                      aria-hidden
                    />
                    Вход…
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link
                  href={signUpHref}
                  className={AUTH_CARD_LINK_CLASS}
                  prefetch
                >
                  Зарегистрироваться
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AuthShell>
  );
}
