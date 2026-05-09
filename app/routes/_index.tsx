import {useState, useCallback, useMemo, useRef, useEffect, Suspense} from 'react';
import {useLoaderData, useRouteLoaderData, useNavigate} from 'react-router';
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
  const [
    {products},
    {menu},
    {collection: promoCollection},
    {metaobject: siteSettings},
  ] = await Promise.all([
    context.storefront.query(CANVAS_PRODUCTS_QUERY, {variables: {first: 48}}),
    context.storefront.query(MENU_QUERY, {variables: {handle: 'main-menu'}}),
    context.storefront.query(CART_PROMO_QUERY, {variables: {handle: 'cart-promo'}}),
    context.storefront.query(SITE_SETTINGS_QUERY),
  ]);

  // Parse metaobject fields into a plain object
  const settings: Record<string, string> = {};
  for (const field of siteSettings?.fields ?? []) {
    settings[field.key] = field.value;
  }

  return {
    products: products.nodes as CanvasProduct[],
    menuItems: (menu?.items ?? []) as MenuItem[],
    promoProducts: promoCollection?.products?.nodes ?? [],
    settings,
  };
}

export default function Index() {
  const {products, menuItems, promoProducts, settings} = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const rootData = useRouteLoaderData<RootLoader>('root');

  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<CanvasProduct | null>(null);
  const [selected, setSelected] = useState<CanvasProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [activeType, setActiveType] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

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

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.productType?.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [products, query]);

  // Collapse search on outside click
  useEffect(() => {
    if (!searchOpen) return;
    function handleOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [searchOpen]);

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
              {settings.tagline ?? 'Edition 01'}
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

      {/* Expandable search pill */}
      <div
        ref={searchRef}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        {/* Pill */}
        <div
          className={`flex items-center gap-2.5 bg-card/80 backdrop-blur-md border border-border rounded-full shadow-sm transition-all duration-300 overflow-hidden h-10 ${
            searchOpen
              ? 'w-[min(400px,calc(100vw-3rem))] px-4 border-accent/40'
              : 'w-auto px-4 cursor-pointer hover:border-accent/60'
          }`}
          onClick={() => !searchOpen && setSearchOpen(true)}
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          {searchOpen ? (
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                  setSearchOpen(false);
                  setQuery('');
                }
              }}
              placeholder="Search the field…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none font-sans min-w-0"
            />
          ) : (
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Search
            </span>
          )}
          {searchOpen && query && (
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
        {searchOpen && searchResults.length > 0 && (
          <div className="mt-2 w-[min(400px,calc(100vw-3rem))] bg-card/90 backdrop-blur-md border border-border rounded-2xl overflow-hidden shadow-lg">
            {searchResults.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelected(product);
                  setSearchOpen(false);
                  setQuery('');
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left border-b border-border/60 last:border-0"
              >
                <div className="min-w-0">
                  <div className="font-display text-base leading-tight truncate">{product.title}</div>
                  {product.productType && (
                    <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-0.5">{product.productType}</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  ${parseFloat(product.priceRange.minVariantPrice.amount)}
                </div>
              </button>
            ))}
            {/* Full results link */}
            <button
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                setSearchOpen(false);
                setQuery('');
              }}
              className="w-full px-4 py-2.5 text-[9px] uppercase tracking-[0.3em] text-accent hover:bg-muted/30 transition-colors text-center border-t border-border/60"
            >
              See all results for "{query}" →
            </button>
          </div>
        )}

        {/* No results */}
        {searchOpen && query.trim() && searchResults.length === 0 && (
          <div className="mt-2 w-[min(400px,calc(100vw-3rem))] bg-card/90 backdrop-blur-md border border-border rounded-2xl px-4 py-3 text-center">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Nothing found</span>
          </div>
        )}
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
                <CartIcon />
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
                    <CartIcon />
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
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} promoProducts={promoProducts} />

      <h1 className="sr-only">Maison Écho — An infinite, spatial store</h1>
    </main>
  );
}

function CartIcon() {
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
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
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

const SITE_SETTINGS_QUERY = `#graphql
  query SiteSettings {
    metaobject(handle: {handle: "site-settings", type: "site_settings"}) {
      fields { key value }
    }
  }
` as const;

const CART_PROMO_QUERY = `#graphql
  query CartPromo($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 4) {
        nodes {
          id title handle
          priceRange { minVariantPrice { amount currencyCode } }
          featuredImage { url altText }
          variants(first: 1) { nodes { id availableForSale } }
        }
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
