import { HomePageContent } from '@/widgets/home/HomePageContent'
import { Footer } from '@/widgets/navigation/Footer'
import { Header } from '@/widgets/navigation/Header'

/**
 * Home page composition (FSD views layer).
 * Контент главной скрыт — фокус на авторизации. После настройки auth от этого отталкиваемся.
 */
export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <HomePageContent />
      </main>

      <Footer />
    </div>
  )
}
