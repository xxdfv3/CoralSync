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

const signInSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const defaultValues: SignInFormValues = {
  email: "",
  password: "",
};

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL =
    searchParams?.get("callbackURL") ?? "/";
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Введите email и пароль для входа в CoralSync
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
                      <Input
                        id="sign-in-password"
                        type="password"
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
            <CardFooter className="flex flex-col gap-4 pt-8">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Вход…
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
              <p className="text-muted-foreground text-center text-sm">
                Нет аккаунта?{" "}
                <Link
                  href={`/sign-up${callbackURL !== "/" ? `?callbackURL=${encodeURIComponent(callbackURL)}` : ""}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Зарегистрироваться
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
