/**
 * Fallback при переходе на /sign-in | /sign-up до гидрации клиента.
 * Без lucide — чистый CSS, без клиентского бандла.
 */
export default function AuthLoading() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm dark:bg-black/80"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="size-10 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground motion-safe:animate-spin motion-reduce:animate-none"
        aria-hidden
      />
      <span className="sr-only">Загрузка…</span>
    </div>
  );
}
