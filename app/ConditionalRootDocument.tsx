'use client'

import { usePathname } from 'next/navigation'
import { Toaster } from '@/shared/ui/sonner'

/**
 * Для /admin* не рендерим html/body — их отдаёт Payload RootLayout.
 * Иначе получится вложенный <html> внутри <body> и ошибка гидрации.
 */
export function ConditionalRootDocument({
  children,
  fontClassName,
}: {
  children: React.ReactNode
  fontClassName: string
}) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <html lang="en">
      <body className={fontClassName}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
