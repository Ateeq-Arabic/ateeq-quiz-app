export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 space-y-6">
      <h1 className="text-3xl">Hello World (English - Raleway)</h1>
      <p className="text-2xl" lang="ar">
        اَلسَّلَامُ عَلَيْكُمْ (Arabic - Scheherazade)
      </p>

      <h1 className="text-3xl text-[var(--primary)]">Primary Color</h1>
      <p className="text-2xl text-[var(--secondary)]">Secondary Color</p>
      <div className="p-4 border border-border text-[var(--accent)]">
        Box with border and accent text
      </div>
    </main>
  );
}
