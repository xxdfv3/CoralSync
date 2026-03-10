import { SettingsProfileContent } from '@/widgets/settings/SettingsProfileContent'
import { Footer } from '@/widgets/navigation/Footer'
import { Header } from '@/widgets/navigation/Header'

/**
 * Страница настроек профиля (никнейм + аватар).
 */
export function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-8 lg:px-8">
        <SettingsProfileContent />
      </main>
      <Footer />
    </div>
  )
}
