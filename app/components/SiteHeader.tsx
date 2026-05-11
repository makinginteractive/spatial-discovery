// app/components/SiteHeader.tsx

export function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-30 h-16 bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between px-5 sm:px-10">
      {/* Brand */}
      <a
        href="/"
        className="font-display text-xl tracking-tight hover:opacity-70 transition-opacity"
      >
        P3XIV
      </a>

      {/* Search form — hidden on mobile */}
      <form
        action="/search"
        method="get"
        className="hidden sm:flex items-center gap-2.5 bg-card/70 border border-border rounded-full px-4 h-8 hover:border-accent/60 transition-colors"
      >
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          name="q"
          placeholder="Search…"
          className="bg-transparent text-[11px] uppercase tracking-[0.2em] placeholder:text-muted-foreground/60 focus:outline-none w-[100px]"
        />
      </form>

      {/* Right nav */}
      <nav className="flex items-center gap-5 sm:gap-7 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <a href="/pages/contact" className="hover:text-foreground transition-colors">
          Contact
        </a>
        <a href="/policies/refund-policy" className="hover:text-foreground transition-colors">
          Returns
        </a>
      </nav>
    </header>
  );
}
