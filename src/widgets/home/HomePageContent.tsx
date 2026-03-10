'use client'

import Link from 'next/link'

import { useSession } from '@/shared/api/auth-client'
import { Button } from '@/shared/ui/button'
import { SignOutBlock } from '@/features/auth'

/**
 * Контент главной: только авторизация.
 * Для гостей — призыв войти/зарегистрироваться, для авторизованных — приветствие и выход.
 */
export function HomePageContent() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="text-muted-foreground text-center">
        <span className="inline-block size-6 animate-pulse">…</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Добро пожаловать в CoralSync
        </h1>
        <SignOutBlock />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        CoralSync
      </h1>
      <p className="text-muted-foreground">
        Войдите или зарегистрируйтесь, чтобы продолжить.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" asChild>
          <Link href="/sign-in">Войти</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Регистрация</Link>
        </Button>
      </div>
    </div>
  )
}
