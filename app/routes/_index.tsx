import {useState, useCallback, useMemo, useEffect, useRef, Suspense} from 'react';
import {useLoaderData, useRouteLoaderData} from 'react-router';
import {Await} from 'react-router';
import type {Route} from './+types/_index';
import type {RootLoader} from '~/root';
import {InfiniteCanvas, type CanvasProduct} from '~/components/InfiniteCanvas';
import {ProductOverlay} from '~/components/ProductOverlay';
import {CartDrawer} from '~/components/CartDrawer';

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

export async function loader({context}: Route.LoaderArgs) {
  const {products} = await context.storefront.query(CANVAS_PRODUCTS_QUERY, {
    variables: {first: 48},
  });
  return {products: products.nodes as CanvasProduct[]};
}

export default function Index() {
  const {products} = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoader>('root');

  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<CanvasProduct | null>(null);
  const [mousePos, setMousePos] = useState({x: 0, y: 0});
  const [selected, setSelected] = useState<CanvasProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [activeType, setActiveType] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = useCallback((p: CanvasProduct) => setSelected(p), []);
  const handleHover = useCallback((p: CanvasProduct | null) => setHovered(p), []);

  // Track mouse for label positioning
  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({x: e.clientX, y: e.clientY});
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const productTypes = useMemo(() => {
    const types = new Set(products.map((p) => p.productType).filter(Boolean));
    return Array.from(types).sort();
  }, [products]);

  const displayedProducts = useMemo(() => {
    if (!activeType) return products;
    return products.filter((p) => p.productType === activeType);
  }, [products, activeType]);

  function openCollections() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setCollectionsOpen(true);
  }

  function scheduleClose() {
    closeTimerRef.current = setTimeout(() => setCollectionsOpen(false), 180);
  }

  function handleTypeSelect(type: string) {
    setActiveType(activeType === type ? null : type);
    setCollectionsOpen(false);
  }

  function handleFieldClick() {
    setActiveType(null);
    setCollectionsOpen(false);
  }

  return (
    <main className="fixed inset-0 grain overflow-hidden">
      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, oklch(0.972 0.012 85 / 0.0) 50%, oklch(0.85 0.02 75 / 0.55) 100%)',
        }}
      />

      <InfiniteCanvas
        products={displayedProducts}
        query={query}
        onSelect={handleSelect}
        onHover={handleHover}
      />

      {/* Top bar */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 sm:px-10 h-16 pointer-events-none">
        <div className="flex items-baseline gap-3 pointer-events-auto">
          <span className="font-display text-xl tracking-tight">Maison Écho</span>
          {activeType ? (
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-accent">
              {activeType}
            </span>
          ) : (
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Edition 01
            </span>
          )}
        </div>
        <nav className="flex items-center gap-5 sm:gap-7 text-[10px] uppercase tracking-[0.3em] text-muted-foreground pointer-events-auto">
          <a href="/about" className="hover:text-foreground transition-colors">About</a>
          <a href="/journal" className="hidden sm:inline hover:text-foreground transition-colors">Journal</a>
          <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
        </nav>
      </header>

      {/* Search pill — desktop */}
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

      {/* Search pill — mobile */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-[min(440px,calc(100vw-2.5rem))] md:hidden">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the field…"
          className="w-full h-10 bg-card/70 backdrop-blur-md border border-border rounded-full px-5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 font-sans"
        />
      </div>

      {/* Hover label — follows cursor, sits above the tile */}
      <div
        className={`fixed z-20 pointer-events-none transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: mousePos.x,
          top: mousePos.y - 90,
          transform: 'translateX(-50%)',
        }}
      >
        {hovered && (
          <div className="text-center whitespace-nowrap">
            <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-0.5">
              {hovered.productType}
            </div>
            <div className="font-display text-xl sm:text-2xl leading-tight">
              {hovered.title}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              ${parseFloat(hovered.priceRange.minVariantPrice.amount)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom cluster — hover opens collection pills */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        onMouseLeave={scheduleClose}
        onMouseEnter={() => {
          if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        }}
      >
        {/* Collection type pills */}
        <div
          className={`transition-all duration-300 ${
            collectionsOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[min(520px,calc(100vw-2rem))]">
            {productTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className={`px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] rounded-full border transition-colors duration-200 ${
                  activeType === type
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-card/80 backdrop-blur-md border-border hover:border-accent hover:text-accent'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Menu pill */}
        <div className="flex items-center bg-card/80 backdrop-blur-md border border-border rounded-full px-1 py-1 shadow-lg gap-0.5">
          <button
            onClick={handleFieldClick}
            className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] rounded-full transition-colors ${
              !activeType && !collectionsOpen
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Field
          </button>

          <button
            onMouseEnter={openCollections}
            onClick={() => setCollectionsOpen((o) => !o)}
            className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] rounded-full transition-colors ${
              collectionsOpen || activeType
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeType ?? 'Collections'}
          </button>

          <a
            href="/journal"
            className="hidden sm:inline px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors rounded-full"
          >
            Journal
          </a>

          <div className="w-px h-4 bg-border mx-1" />

          <Suspense
            fallback={
              <button
                onClick={() => setCartOpen(true)}
                className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors rounded-full"
              >
                Bag
              </button>
            }
          >
            <Await resolve={rootData?.cart}>
              {(cart) => {
                const count = cart?.totalQuantity ?? 0;
                return (
                  <button
                    onClick={() => setCartOpen(true)}
                    className="relative px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors rounded-full"
                  >
                    Bag
                    {count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-accent text-accent-foreground text-[9px] rounded-full flex items-center justify-center px-1 font-sans font-medium leading-none">
                        {count}
                      </span>
                    )}
                  </button>
                );
              }}
            </Await>
          </Suspense>
        </div>
      </div>

      <ProductOverlay product={selected} onClose={() => setSelected(null)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <h1 className="sr-only">Maison Écho — An infinite, spatial store</h1>
    </main>
  );
}

const CANVAS_PRODUCTS_QUERY = `#graphql
  query CanvasProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT) {
      nodes {
        id
        title
        handle
        description
        productType
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
        }
        images(first: 5) {
          nodes {
            url
            altText
          }
        }
        variants(first: 1) {
          nodes {
            id
            availableForSale
          }
        }
      }
    }
  }
` as const;
