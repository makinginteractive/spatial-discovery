import {useState, useCallback} from 'react';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {InfiniteCanvas, type CanvasProduct} from '~/components/InfiniteCanvas';
import {ProductOverlay} from '~/components/ProductOverlay';

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
    variables: {first: 24},
  });
  return {products: products.nodes as CanvasProduct[]};
}

export default function Index() {
  const {products} = useLoaderData<typeof loader>();
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<CanvasProduct | null>(null);
  const [selected, setSelected] = useState<CanvasProduct | null>(null);

  const handleSelect = useCallback((p: CanvasProduct) => setSelected(p), []);
  const handleHover = useCallback(
    (p: CanvasProduct | null) => setHovered(p),
    [],
  );

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

      <InfiniteCanvas
        products={products}
        query={query}
        onSelect={handleSelect}
        onHover={handleHover}
      />

      {/* TOP BAR */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 sm:px-10 h-16 pointer-events-none">
        <div className="flex items-baseline gap-3 pointer-events-auto">
          <span className="font-display text-xl tracking-tight">
            Maison Écho
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Edition 01
          </span>
        </div>
        <nav className="flex items-center gap-5 sm:gap-7 text-[10px] uppercase tracking-[0.3em] text-muted-foreground pointer-events-auto">
          <a href="/about" className="hover:text-foreground transition-colors">
            About
          </a>
          <a
            href="/journal"
            className="hidden sm:inline hover:text-foreground transition-colors"
          >
            Journal
          </a>
          <a
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </a>
          <a
            href="/contact"
            className="hover:text-foreground transition-colors"
          >
            Contact
          </a>
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
              {hovered.productType}
            </div>
            <div className="font-display text-3xl sm:text-4xl">
              {hovered.title}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ${parseFloat(hovered.priceRange.minVariantPrice.amount)} · click
              to open
            </div>
          </div>
        )}
      </div>

      {/* MENU PILL */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-1 bg-card/80 backdrop-blur-md border border-border rounded-full pl-2 pr-2 py-2 shadow-lg">
          <a
            href="#"
            className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:text-accent transition-colors"
          >
            Field
          </a>
          <a
            href="/collections"
            className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:text-accent transition-colors"
          >
            Collections
          </a>
          <a
            href="/journal"
            className="hidden sm:inline px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:text-accent transition-colors"
          >
            Journal
          </a>
        </div>
      </div>

      <ProductOverlay
        product={selected}
        onClose={() => setSelected(null)}
      />

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
