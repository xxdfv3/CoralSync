'use client'

import Link from 'next/link'

import { Logo } from '@/shared/ui/logo'

const footerLinks = {
  browse: [
    { label: 'Anime', href: '/anime' },
    { label: 'Movies', href: '/movies' },
    { label: 'Series', href: '/series' },
    { label: 'Schedule', href: '/schedule' },
  ],
  genres: [
    { label: 'Action', href: '/genres/action' },
    { label: 'Romance', href: '/genres/romance' },
    { label: 'Comedy', href: '/genres/comedy' },
    { label: 'Sci-Fi', href: '/genres/sci-fi' },
  ],
  community: [
    { label: 'Discord', href: '#' },
    { label: 'Telegram', href: '#' },
    { label: 'GitHub', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo width={140} href="/" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Your personal tracker for anime, movies, and series. Discover, track, and organize your watchlist.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Browse</h3>
            <ul className="space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Genres</h3>
            <ul className="space-y-2">
              {footerLinks.genres.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} CoralSync. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
