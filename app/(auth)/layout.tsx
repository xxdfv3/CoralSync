import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Авторизация | CoralSync",
  description:
    "Вход и регистрация в CoralSync — отслеживание аниме, фильмов и сериалов",
  robots: "noindex, nofollow",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
