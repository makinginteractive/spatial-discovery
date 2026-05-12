import {useState, useRef, useEffect} from 'react';
import {useFetcher, useNavigate} from 'react-router';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Debounced predictive fetch
  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(() => {
      fetcher.load(`/search?q=${encodeURIComponent(query.trim())}&predictive&limit=6`);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Outside click collapses
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Focus input when opening
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const products: any[] = (fetcher.data as any)?.result?.items?.products ?? [];

  function submit() {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery('');
  }

  return (
    <header className="fixed top-0 inset-x-0 z-30 h-16 bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between px-5 sm:px-10">
      {/* Brand */}
      <a
        href="/"
        className="font-display text-xl tracking-tight hover:opacity-70 transition-opacity"
      >
        P3XIV
      </a>

      {/* Search — hidden on mobile */}
      <div ref={containerRef} className="hidden sm:flex flex-col items-center absolute left-1/2 -translate-x-1/2">
        {/* Pill */}
        <div
          className={`flex items-center gap-2.5 bg-card/70 border border-border rounded-full px-4 h-8 transition-all duration-300 overflow-hidden ${
            open
              ? 'w-[min(400px,calc(100vw-16rem))] hover:border-accent/60 focus-within:border-accent/60'
              : 'w-auto cursor-pointer hover:border-accent/60'
          }`}
          onClick={() => !open && setOpen(true)}
        >
          <svg
            width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          {open ? (
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}
              placeholder="Search the field…"
              aria-label="Search"
              className="flex-1 bg-transparent text-[11px] uppercase tracking-[0.2em] placeholder:text-muted-foreground/60 min-w-0"
              style={{outline: 'none', border: 'none', boxShadow: 'none', WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent'}}
            />
          ) : (
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Search</span>
          )}
          {open && query && (
            <button
              onClick={(e) => { e.stopPropagation(); setQuery(''); }}
              className="shrink-0 text-muted-foreground hover:text-foreground text-lg leading-none"
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>

        {/* Live results */}
        {open && query.trim() && products.length > 0 && (
          <div className="absolute top-10 w-[min(400px,calc(100vw-16rem))] bg-card/90 backdrop-blur-md border border-border rounded-2xl overflow-hidden shadow-lg">
            {products.map((p: any) => (
              <button
                key={p.id}
                onClick={() => { navigate(`/products/${p.handle}`); setOpen(false); setQuery(''); }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left border-b border-border/60 last:border-0"
              >
                <div className="min-w-0">
                  <div className="font-display text-base leading-tight truncate">{p.title}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  ${parseFloat(p.selectedOrFirstAvailableVariant?.price?.amount ?? '0')}
                </div>
              </button>
            ))}
            <button
              onClick={submit}
              className="w-full px-4 py-2.5 text-[9px] uppercase tracking-[0.3em] text-accent hover:bg-muted/30 transition-colors text-center border-t border-border/60"
            >
              See all results for "{query}" →
            </button>
          </div>
        )}

        {/* No results */}
        {open && query.trim() && products.length === 0 && fetcher.state === 'idle' && fetcher.data && (
          <div className="absolute top-10 w-[min(400px,calc(100vw-16rem))] bg-card/90 backdrop-blur-md border border-border rounded-2xl px-4 py-3 text-center">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Nothing found</span>
          </div>
        )}
      </div>

      {/* Right nav */}
      <nav className="flex items-center gap-5 sm:gap-7 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <a href="/pages/contact" className="hover:text-foreground transition-colors">Contact</a>
        <a href="/policies/refund-policy" className="hover:text-foreground transition-colors">Returns</a>
      </nav>
    </header>
  );
}
