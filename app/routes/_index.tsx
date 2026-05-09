import {useState, useCallback, useMemo, useRef, Suspense} from 'react';
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

type MenuItem = {id: string; title: string; url: string; type: string};

function toPath(url: string) {
  try { return new URL(url).pathname; } catch { return url; }
}

export async function loader({context}: Route.LoaderArgs) {
  const [{products}, {menu}] = await Promise.all([
    context.storefront.query(CANVAS_PRODUCTS_QUERY, {variables: {first: 48}}),
    context.storefront.query(MENU_QUERY, {variables: {handle: 'main-menu'}}),
  ]);
  return {
    products: products.nodes as CanvasProduct[],
    menuItems: (menu?.items ?? []) as MenuItem[],
  };
}

export default function Index() {
  const {products, menuItems} = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoader>('root');

  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<CanvasProduct | null>(null);
  const [selected, setSelected] = useState<CanvasProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [activeType, setActiveType] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((p: CanvasProduct) => setSelected(p), []);
  const handleHover = useCallback((p: CanvasProduct | null) => setHovered(p), []);

  // Direct DOM update from canvas animation loop — no React re-render per frame
  const handleHoverMove = useCallback((x: number, y: number) => {
    if (labelRef.current) {
      labelRef.current.style.left = `${x}px`;
      labelRef.current.style.top = `${y - 100}px`;
    }
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

      {/* Scripture watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center px-8 max-w-xl select-none" style={{opacity: 0.13}}>
          <p className="font-display text-2xl sm:text-3xl leading-snug tracking-tight italic text-foreground">
            "I press on toward the goal to win the prize for which God has called me heavenward in Christ Jesus"
          </p>
          <p className="mt-3 text-[9px] uppercase tracking-[0.35em] font-sans text-foreground">
            Philippians 3:14
          </p>
        </div>
      </div>

      <InfiniteCanvas
        products={displayedProducts}
        query={query}
        onSelect={handleSelect}
        onHover={handleHover}
        onHoverMove={handleHoverMove}
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
          {menuItems
            .filter((item) => item.type !== 'FRONTPAGE')
            .map((item) => (
              <a
                key={item.id}
                href={toPath(item.url)}
                className="hover:text-foreground transition-colors"
              >
                {item.title}
              </a>
            ))}
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

      {/* Hover label — pinned to tile center via direct DOM update */}
      <div
        ref={labelRef}
        className={`fixed z-20 pointer-events-none -translate-x-1/2 transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
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

          {menuItems
            .filter((item) => item.type !== 'FRONTPAGE' && item.type !== 'CATALOG')
            .map((item) => (
              <a
                key={item.id}
                href={toPath(item.url)}
                className="hidden sm:inline px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors rounded-full"
              >
                {item.title}
              </a>
            ))}

          <div className="w-px h-4 bg-border mx-1" />

          <Suspense
            fallback={
              <button
                onClick={() => setCartOpen(true)}
                className="relative px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
                aria-label="Open bag"
              >
                <BagIcon />
              </button>
            }
          >
            <Await resolve={rootData?.cart}>
              {(cart) => {
                const count = cart?.totalQuantity ?? 0;
                return (
                  <button
                    onClick={() => setCartOpen(true)}
                    className="relative px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
                    aria-label="Open bag"
                  >
                    <BagIcon />
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

function BagIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

const MENU_QUERY = `#graphql
  query MainMenu($handle: String!) {
    menu(handle: $handle) {
      items {
        id
        title
        url
        type
      }
    }
  }
` as const;

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
