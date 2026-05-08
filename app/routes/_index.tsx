import {useState, useCallback} from 'react';
import type {Route} from './+types/_index';
import {InfiniteCanvas} from '~/components/InfiniteCanvas';
import {ProductOverlay} from '~/components/ProductOverlay';
import {CartDrawer} from '~/components/CartDrawer';
import type {Product} from '~/lib/products';

export const meta: Route.MetaFunction = () => [
  {title: 'MAISON ÉCHO — An infinite store'},
  {
    name: 'description',
    content:
      'A spatial, infinite product field. Drift, search, and discover objects of slow design.',
  },
  {property: 'og:title', content: 'MAISON ÉCHO — An infinite store'},
  {property: 'og:description', content: 'A spatial, infinite product field.'},
];

export default function Index() {
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<{product: Product; qty: number}[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const handleSelect = useCallback((p: Product) => setSelected(p), []);
  const handleHover = useCallback((p: Product | null) => setHovered(p), []);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const i = prev.findIndex((x) => x.product.id === p.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = {...next[i], qty: next[i].qty + 1};
        return next;
      }
      return [...prev, {product: p, qty: 1}];
    });
    setSelected(null);
    setCartOpen(true);
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((x) => x.product.id !== id));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <main className="fixed inset-0 grain overflow-hidden">
      {/* radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, oklch(0.972 0.012 85 / 0.0) 50%, oklch(0.85 0.02 75 / 0.55) 100%)',
        }}
      />

      <InfiniteCanvas query={query} onSelect={handleSelect} onHover={handleHover} />

      {/* TOP BAR */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 sm:px-10 h-16 pointer-events-none">
        <div className="flex items-baseline gap-3 pointer-events-auto">
          <span className="font-display text-xl tracking-tight">Maison Écho</span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Edition 01
          </span>
        </div>
        <nav className="flex items-center gap-5 sm:gap-7 text-[10px] uppercase tracking-[0.3em] text-muted-foreground pointer-events-auto">
          <a href="/about" className="hover:text-foreground transition-colors">About</a>
          <a href="/journal" className="hidden sm:inline hover:text-foreground transition-colors">Journal</a>
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
        </nav>
      </header>

      {/* SEARCH PILL — desktop */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 w-[min(440px,calc(100vw-12rem))] hidden md:block">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the field…"
            className="w-full h-11 bg-card/70 backdrop-blur-md border border-border rounded-full px-5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 font-sans shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted text-sm"
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* SEARCH PILL — mobile */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-[min(440px,calc(100vw-2.5rem))] md:hidden">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the field…"
          className="w-full h-10 bg-card/70 backdrop-blur-md border border-border rounded-full px-5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 font-sans"
        />
      </div>

      {/* HOVER LABEL */}
      <div
        className={`absolute z-20 left-1/2 -translate-x-1/2 bottom-32 transition-all duration-500 pointer-events-none ${
          hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {hovered && (
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
              {hovered.tag}
            </div>
            <div className="font-display text-3xl sm:text-4xl">{hovered.name}</div>
            <div className="text-sm text-muted-foreground mt-1">
              ${hovered.price} · click to open
            </div>
          </div>
        )}
      </div>

      {/* MENU PILL — bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-1 bg-card/80 backdrop-blur-md border border-border rounded-full pl-2 pr-2 py-2 shadow-lg">
          <a href="#" className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:text-accent transition-colors">Field</a>
          <a href="/collections" className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:text-accent transition-colors">Collections</a>
          <a href="/journal" className="hidden sm:inline px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:text-accent transition-colors">Journal</a>
          <span className="w-px h-5 bg-border mx-1" />
          <button
            onClick={() => setCartOpen(true)}
            className="relative px-4 py-2 text-[10px] uppercase tracking-[0.25em] bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors"
          >
            Bag{cartCount > 0 && <span className="ml-1.5">({cartCount})</span>}
          </button>
        </div>
      </div>

      <ProductOverlay
        product={selected}
        onClose={() => setSelected(null)}
        onAdd={addToCart}
      />
      <CartDrawer
        items={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
      />

      <h1 className="sr-only">Maison Écho — An infinite, spatial store</h1>
    </main>
  );
}
