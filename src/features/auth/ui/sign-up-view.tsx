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

const usernameSchema = z
  .string()
  .min(2, "Не менее 2 символов")
  .max(32, "Не более 32 символов")
  .regex(
    /^[a-zA-Z0-9_\-.]+$/,
    "Только латиница, цифры, _, - и . без пробелов"
  );

const signUpSchema = z
  .object({
    username: usernameSchema,
    email: z.string().min(1, "Введите email").email("Некорректный email"),
    password: z
      .string()
      .min(8, "Пароль не менее 8 символов")
      .max(72, "Пароль не более 72 символов"),
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const defaultValues: SignUpFormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function buildAuthHref(path: string, callbackURL: string) {
  return callbackURL !== "/"
    ? `${path}?callbackURL=${encodeURIComponent(callbackURL)}`
    : path;
}

/**
 * Полный UI регистрации. Используется и на /sign-up, и в intercepting slot.
 */
export function SignUpView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams?.get("callbackURL") ?? "/";
  const { data: session, isPending: isSessionPending } = useSession();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!isSessionPending && session) {
      router.replace(callbackURL);
    }
  }, [session, isSessionPending, router, callbackURL]);

  async function onSubmit(values: SignUpFormValues) {
    form.clearErrors("root");
    // Better Auth хранит отображаемое имя в поле user.name — передаём username туда.
    const { error } = await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.username,
        callbackURL,
      },
      {
        onRequest: () => {
          form.resetField("password", { keepDirty: false });
          form.resetField("confirmPassword", { keepDirty: false });
        },
        onSuccess: () => {
          toast.success("Регистрация успешна. Добро пожаловать!");
          router.push(callbackURL);
        },
        onError: (ctx) => {
          toast.error(ctx.error?.message ?? "Ошибка регистрации");
        },
      }
    );

    if (error) {
      form.setError("root", { message: error.message });
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

  const signInHref = buildAuthHref("/sign-in", callbackURL);

  return (
    <AuthShell ariaLabel="Регистрация в CoralSync">
      <Card className={AUTH_CARD_CLASS}>
        <CardHeader className="space-y-1 px-6 pb-0 pt-10 text-center sm:text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Регистрация
          </CardTitle>
          <CardDescription className="text-pretty">
            Создайте аккаунт CoralSync
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="sign-up-username">Имя пользователя</FormLabel>
                    <FormControl>
                      <Input
                        id="sign-up-username"
                        type="text"
                        placeholder="nickname"
                        autoComplete="username"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="sign-up-email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="sign-up-email"
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
                    <FormLabel htmlFor="sign-up-password">Пароль</FormLabel>
                    <FormControl>
                      <PasswordInput
                        id="sign-up-password"
                        placeholder="Не менее 8 символов"
                        autoComplete="new-password"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="sign-up-confirm-password">
                      Подтверждение пароля
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        id="sign-up-confirm-password"
                        placeholder="Повторите пароль"
                        autoComplete="new-password"
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
                    Регистрация…
                  </>
                ) : (
                  "Зарегистрироваться"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <Link
                  href={signInHref}
                  className={AUTH_CARD_LINK_CLASS}
                  prefetch
                >
                  Войти
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AuthShell>
  );
}
