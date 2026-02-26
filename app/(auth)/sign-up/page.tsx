"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

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

const signUpSchema = z
  .object({
    name: z.string().min(1, "Введите имя").max(100, "Слишком длинное имя"),
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
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL =
    searchParams?.get("callbackURL") ?? "/";
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
    const { error } = await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
    style={{ backgroundColor: "#F2F2F2" }}
    >
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт CoralSync
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="sign-up-name">Имя</FormLabel>
                    <FormControl>
                      <Input
                        id="sign-up-name"
                        type="text"
                        placeholder="Ваше имя"
                        autoComplete="name"
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
                      <Input
                        id="sign-up-password"
                        type="password"
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
                      <Input
                        id="sign-up-confirm-password"
                        type="password"
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
            <CardFooter className="flex flex-col gap-4 pt-8">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                style={{ backgroundColor: "#E93C47" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Регистрация…
                  </>
                ) : (
                  "Зарегистрироваться"
                )}
              </Button>
              <p className="text-muted-foreground text-center text-sm">
                Уже есть аккаунт?{" "}
                <Link
                  href={`/sign-in${callbackURL !== "/" ? `?callbackURL=${encodeURIComponent(callbackURL)}` : ""}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Войти
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
