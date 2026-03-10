'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { List, LogOut, Menu, Moon, Search, Settings, Star, Sun } from 'lucide-react'

import { authClient, useSession } from '@/shared/api/auth-client'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Logo } from '@/shared/ui/logo'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'

const navLinks = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Расписание', href: '/schedule' },
]

const THEME_EVENT = 'coralsync-theme-change'

function UserAvatar({
  imageUrl,
  name,
  email,
  size,
  className,
}: {
  imageUrl?: string | null
  name?: string | null
  email?: string | null
  size: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const initial = (name ?? email ?? '?').charAt(0).toUpperCase()
  const showImage = imageUrl && !failed

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Payload/Media URL без remotePatterns
      <img
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 rounded-lg object-cover ${className ?? ''}`}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <span className="text-sm font-medium">{initial}</span>
    </span>
  )
}

function readTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function subscribeTheme(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'theme') onStoreChange()
  }
  const onCustom = () => onStoreChange()
  window.addEventListener('storage', onStorage)
  window.addEventListener(THEME_EVENT, onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(THEME_EVENT, onCustom)
  }
}

function getThemeSnapshot(): 'light' | 'dark' {
  return readTheme()
}

function getThemeServerSnapshot(): 'light' | 'dark' {
  return 'dark'
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  )
  const { data: session, isPending } = useSession()

  const applyThemeClass = useCallback((value: 'light' | 'dark') => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', value === 'dark')
  }, [])

  useEffect(() => {
    applyThemeClass(theme)
  }, [theme, applyThemeClass])

  function toggleTheme() {
    const next: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    applyThemeClass(next)
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  async function handleSignOut() {
    await authClient.signOut({ fetchOptions: { onSuccess: () => window.location.assign('/') } })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo + theme toggle */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo href={null} width={40} height={40} priority />
            <h1 className="text-2xl font-bold">CoralSync</h1>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-sm hover:bg-secondary"
            aria-label={
              theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'
            }
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="size-5" />
            <span className="sr-only">Search</span>
          </Button>

          <div className="hidden items-center gap-2 sm:flex">
            {isPending ? (
              <span className="text-muted-foreground text-sm">…</span>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <UserAvatar
                      imageUrl={session.user.image}
                      name={session.user.name}
                      email={session.user.email}
                      size={32}
                    />
                    <span className="sr-only">Меню пользователя</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px]">
                  <div className="flex items-center gap-3 px-2 py-2.5">
                    <UserAvatar
                      imageUrl={session.user.image}
                      name={session.user.name}
                      email={session.user.email}
                      size={40}
                      className="rounded-lg"
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {session.user.name ?? session.user.email}
                      </span>
                      {session.user.email && (
                        <span className="truncate text-xs text-muted-foreground">
                          {session.user.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center gap-2">
                      <Star className="size-4" />
                      Избранное
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/collections" className="flex items-center gap-2">
                      <List className="size-4" />
                      Коллекции
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="size-4" />
                      Настройки
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    Выход
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Войти</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Регистрация</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-4 h-px bg-border" />
                {session ? (
                  <>
                    <Link
                      href="/favorites"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Star className="size-4" />
                      Избранное
                    </Link>
                    <Link
                      href="/collections"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <List className="size-4" />
                      Коллекции
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Settings className="size-4" />
                      Настройки
                    </Link>
                    <div className="my-2 h-px bg-border" />
                    <button
                      type="button"
                      onClick={() => { handleSignOut(); setIsOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" />
                      Выход
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setIsOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      Войти
                    </Link>
                    <Button asChild className="mt-2">
                      <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                        Регистрация
                      </Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
